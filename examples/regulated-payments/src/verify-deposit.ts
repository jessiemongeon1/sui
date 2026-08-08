// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiGrpcClient } from '@mysten/sui/grpc';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';

const client = new SuiGrpcClient({
	baseUrl: 'https://fullnode.mainnet.sui.io:443',
	network: 'mainnet',
});
const userSuiAddress = '0xUSER_ADDRESS';
const coinType = '0x2::sui::SUI';
const depositDigest = 'DEPOSIT_TRANSACTION_DIGEST';
// The amount the provider reported depositing, in base units (MIST for SUI).
const expectedAmount = 1_000_000_000n;

// docs::#verify-deposit
// Verify a deposit by loading the transaction the provider reported and
// checking its balance changes. Don't rely on the user's current total
// balance: it includes unrelated funds and proves nothing about this deposit.
const result = await client.getTransaction({
	digest: depositDigest,
	include: { balanceChanges: true },
});

if (result.$kind !== 'Transaction') {
	throw new Error('Deposit transaction failed onchain');
}

const deposited = result.Transaction.balanceChanges
	.filter(
		(change) =>
			normalizeSuiAddress(change.address) === normalizeSuiAddress(userSuiAddress) &&
			normalizeStructTag(change.coinType) === normalizeStructTag(coinType),
	)
	.reduce((sum, change) => sum + BigInt(change.amount), 0n);

// Require an exact match. An unexpected amount, over or under, is a mismatch
// to investigate, not silently accept.
if (deposited !== expectedAmount) {
	throw new Error(`Deposit mismatch: expected ${expectedAmount}, got ${deposited}`);
}

console.log('Amount deposited to user:', deposited);
// docs::/#verify-deposit
