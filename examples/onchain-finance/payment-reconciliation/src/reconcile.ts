// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { SuiClientTypes } from '@mysten/sui/client';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';

const client = new SuiGrpcClient({
	baseUrl: 'https://fullnode.mainnet.sui.io:443',
	network: 'mainnet',
});

// docs::#list-transactions
async function fetchOnchainDigests(sender: string): Promise<Set<string>> {
	const digests = new Set<string>();
	let cursor: string | null = null;
	let hasNextPage = true;

	while (hasNextPage) {
		const page: SuiClientTypes.ListTransactionsResponse = await client.listTransactions({
			filter: { sender },
			limit: 50,
			after: cursor,
		});

		for (const result of page.transactions) {
			const tx = result.$kind === 'Transaction' ? result.Transaction : result.FailedTransaction;
			digests.add(tx.digest);
		}

		// gRPC servers bound how much of the ledger a single request scans, so a
		// page can come back short (or empty) with hasNextPage still true. Loop
		// on hasNextPage, not on page size.
		hasNextPage = page.hasNextPage;
		cursor = page.endCursor;
	}

	return digests;
}
// docs::/#list-transactions

// docs::#verify-payment
interface ExpectedPayment {
	digest: string;
	recipient: string;
	coinType: string;
	amount: bigint;
}

type PaymentCheck =
	| { status: 'confirmed' }
	| { status: 'execution_failed' }
	| { status: 'mismatch'; reason: string };

async function verifyPayment(expected: ExpectedPayment): Promise<PaymentCheck> {
	const result = await client.getTransaction({
		digest: expected.digest,
		include: { balanceChanges: true },
	});

	// The transaction executed but aborted: gas was charged, no payment moved.
	if (result.$kind === 'FailedTransaction') {
		return { status: 'execution_failed' };
	}

	// Balance changes report each address's net change per coin type, so they
	// include entries that are not payments: the sender's own debit (payment
	// plus gas, negative) and credits back to the sender such as storage
	// rebates. Match the credit to the expected recipient and coin type
	// instead of treating every positive change as a payment.
	const recipient = normalizeSuiAddress(expected.recipient);
	const coinType = normalizeStructTag(expected.coinType);

	const credit = result.Transaction.balanceChanges.find(
		(change) =>
			normalizeSuiAddress(change.address) === recipient &&
			normalizeStructTag(change.coinType) === coinType &&
			BigInt(change.amount) > 0n,
	);

	if (!credit) {
		return {
			status: 'mismatch',
			reason: `no ${expected.coinType} credit to ${expected.recipient}`,
		};
	}

	if (BigInt(credit.amount) !== expected.amount) {
		return {
			status: 'mismatch',
			reason: `recipient credited ${credit.amount}, expected ${expected.amount}`,
		};
	}

	return { status: 'confirmed' };
}
// docs::/#verify-payment

// docs::#subscribe-checkpoints
async function watchAgentTransactions(agentAddress: string, onchainDigests: Set<string>) {
	const sender = normalizeSuiAddress(agentAddress);

	// The filter selects checkpoints that contain at least one transaction
	// sent by the agent. A matching checkpoint still carries all of its
	// transactions, so filter per transaction below.
	const { responses } = client.subscriptionService.subscribeCheckpoints({
		filter: {
			terms: [
				{
					literals: [
						{
							negated: false,
							predicate: { oneofKind: 'sender', sender: { address: sender } },
						},
					],
				},
			],
		},
		readMask: {
			paths: [
				'sequence_number',
				'transactions.digest',
				'transactions.transaction',
				'transactions.balance_changes',
			],
		},
	});

	// Subscriptions always start at the current tip and cannot resume. Persist
	// the cursor so that after a disconnect you can replay the missed range
	// with ledgerService.listCheckpoints (same filter, startCheckpoint of
	// lastCursor + 1n) before re-subscribing.
	let lastCursor: bigint | undefined;

	for await (const frame of responses) {
		lastCursor = frame.cursor ?? lastCursor;

		// On filtered streams, frames without a checkpoint only advance the
		// cursor past non-matching checkpoints.
		if (!frame.checkpoint) continue;

		for (const tx of frame.checkpoint.transactions) {
			if (!tx.digest || tx.transaction?.sender !== sender) continue;

			// Feed the same state the reconciliation pass reads.
			onchainDigests.add(tx.digest);
		}
	}
}
// docs::/#subscribe-checkpoints

// docs::#reconcile-algorithm
interface LocalPaymentRecord {
	id: string;
	digest: string | null; // null if the agent never received an execution response
	recipient: string;
	coinType: string;
	amount: bigint;
	status: 'pending' | 'confirmed' | 'failed';
}

interface Discrepancy {
	type:
		| 'execution_failed'
		| 'wrong_payment'
		| 'unacknowledged_confirmation'
		| 'missing_onchain'
		| 'not_yet_final'
		| 'unknown_transaction';
	record?: LocalPaymentRecord;
	digest?: string;
	action: string;
}

async function reconcile(
	localRecords: LocalPaymentRecord[],
	onchainDigests: Set<string>,
): Promise<Discrepancy[]> {
	const discrepancies: Discrepancy[] = [];

	for (const record of localRecords) {
		if (!record.digest) continue;

		if (onchainDigests.has(record.digest)) {
			// The digest is in the sender's finalized history. Verify what
			// actually moved rather than trusting the digest alone: the
			// transaction may have aborted, or paid something other than what
			// the record claims.
			const check = await verifyPayment({
				digest: record.digest,
				recipient: record.recipient,
				coinType: record.coinType,
				amount: record.amount,
			});

			if (check.status === 'execution_failed') {
				discrepancies.push({
					type: 'execution_failed',
					record,
					action: 'Gas was charged but no payment moved. Retry with a new transaction.',
				});
			} else if (check.status === 'mismatch') {
				discrepancies.push({
					type: 'wrong_payment',
					record,
					action: `Onchain balance changes do not match the record: ${check.reason}. Investigate before retrying.`,
				});
			} else if (record.status !== 'confirmed') {
				discrepancies.push({
					type: 'unacknowledged_confirmation',
					record,
					action: 'Payment is final onchain. Mark the record confirmed.',
				});
			}
		} else if (record.status === 'confirmed') {
			// The agent saw an execution response for this digest, so it should
			// appear once the RPC's transaction index catches up to finality.
			discrepancies.push({
				type: 'missing_onchain',
				record,
				action: 'Re-run after the index catches up. Escalate if it stays missing.',
			});
		} else {
			// Submitted, but no execution response and not in finalized history:
			// the transaction may still finalize.
			discrepancies.push({
				type: 'not_yet_final',
				record,
				action: 'Wait and re-run before retrying. A retry while the original is still in flight can double-pay.',
			});
		}
	}

	// Sender transactions onchain that no local record claims: duplicate
	// retries that both finalized, or another process using the agent's key.
	const knownDigests = new Set(localRecords.map((record) => record.digest));
	for (const digest of onchainDigests) {
		if (!knownDigests.has(digest)) {
			discrepancies.push({
				type: 'unknown_transaction',
				digest,
				action: 'Investigate: possible duplicate retry or unauthorized use of the agent key.',
			});
		}
	}

	return discrepancies;
}
// docs::/#reconcile-algorithm

export { fetchOnchainDigests, verifyPayment, watchAgentTransactions, reconcile };
