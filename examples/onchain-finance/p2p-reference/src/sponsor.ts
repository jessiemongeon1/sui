// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { createSponsor } from '@mysten-incubation/sponsor';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import type { Signer } from '@mysten/sui/cryptography';

declare const tx: Transaction;
declare const signer: Signer;
declare const sponsorSigner: Signer;
declare const senderAddress: string;

const client = new SuiGrpcClient({
	baseUrl: 'https://fullnode.testnet.sui.io:443',
	network: 'testnet',
});

// docs::#create-sponsor
// Server side: the sponsor pays gas from its SUI address balance and
// validates every transaction against a pluggable policy before co-signing.
const sponsor = createSponsor({
	signer: sponsorSigner,
	client,
});
// docs::/#create-sponsor

// docs::#sponsor-flow
// Client side: build the transaction with the sponsor as gas owner,
// paying from the sponsor's address balance (no specific gas coins).
tx.setSender(senderAddress);
tx.setGasOwner(sponsor.address);
tx.setGasPayment([]);
const bytes = await tx.build({ client });

// The user signs the final bytes.
const { signature: userSignature } = await signer.signTransaction(bytes);

// Server side: the sponsor validates, co-signs, and executes.
const result = await sponsor.signAndExecuteTransaction({
	transaction: bytes,
	userSignature,
});

// Three outcomes, not two:
switch (result.$kind) {
	case 'Rejected':
		// A validator declined; nothing was signed or executed.
		throw new Error(result.issues.map((issue) => issue.message).join('; '));
	case 'FailedTransaction':
		// Executed on-chain but aborted; the sponsor still paid gas.
		throw new Error(`Payment failed: ${result.FailedTransaction.status.error?.message}`);
	case 'Transaction':
		console.log('Payment confirmed:', result.Transaction.digest);
}
// docs::/#sponsor-flow

// docs::#direct-submit
const directResult = await client.signAndExecuteTransaction({
	transaction: tx,
	signer,
});
// docs::/#direct-submit
