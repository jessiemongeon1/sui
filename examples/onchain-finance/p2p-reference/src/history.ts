// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiGrpcClient } from '@mysten/sui/grpc';

declare const senderAddress: string;

const USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';

const client = new SuiGrpcClient({
	baseUrl: 'https://fullnode.testnet.sui.io:443',
	network: 'testnet',
});

// docs::#query-history
const { transactions } = await client.listTransactions({
	filter: { sender: senderAddress },
	order: 'descending',
	limit: 20,
	include: { balanceChanges: true },
});

for (const result of transactions) {
	// Skip transactions that aborted on-chain.
	if (result.$kind !== 'Transaction') continue;
	const txn = result.Transaction;

	// Pair the sender's negative change with the recipient's positive change
	const sent = txn.balanceChanges.find(
		(change) =>
			change.coinType === USDC &&
			change.address === senderAddress &&
			BigInt(change.amount) < 0n,
	);
	const received = txn.balanceChanges.find(
		(change) =>
			change.coinType === USDC &&
			change.address !== senderAddress &&
			BigInt(change.amount) > 0n,
	);

	if (sent && received) {
		console.log(
			`Sent ${-Number(sent.amount) / 1_000_000} USDC`,
			`to ${received.address}`,
		);
	}
}
// docs::/#query-history
