// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiGrpcClient } from '@mysten/sui/grpc';
import { fromHex, normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';

const suiClient = new SuiGrpcClient({
	baseUrl: 'https://fullnode.mainnet.sui.io:443',
	network: 'mainnet',
});
const webhookSecret = process.env.PROVIDER_WEBHOOK_SECRET!;

// Verifies an HMAC-SHA256 signature over the raw request body. Check your
// provider's documentation for the exact scheme: providers differ in encoding
// (hex or base64), header names, prefixes like `sha256=`, and whether a
// timestamp is included to prevent replay attacks.
async function verifyWebhookSignature(
	rawBody: string,
	signature: string | null,
	secret: string,
): Promise<boolean> {
	if (!signature) {
		return false;
	}

	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['verify'],
	);

	// `crypto.subtle.verify` compares the expected and provided MACs in
	// constant time, avoiding timing side channels.
	return crypto.subtle.verify('HMAC', key, fromHex(signature), new TextEncoder().encode(rawBody));
}

const complianceLogger = {
	warn: async (_msg: string, _data: unknown) => {},
};

const ledger = {
	creditUser: async (_userId: string, _amount: string, _coinType: string) => {},
};

// docs::#webhook-handler
async function handleProviderWebhook(req: Request): Promise<Response> {
	// Step 1: Verify the webhook signature over the raw request body.
	const rawBody = await req.text();
	const signature = req.headers.get('X-Provider-Signature');
	if (!(await verifyWebhookSignature(rawBody, signature, webhookSecret))) {
		return new Response('Invalid signature', { status: 401 });
	}

	const payload = JSON.parse(rawBody);

	// Step 2: Verify onchain state. Load the transaction the webhook references
	// and check its balance changes. Don't compare against the recipient's
	// current total balance: that can exceed the deposit amount for unrelated
	// reasons, before any deposit transaction has landed. If your fullnode can
	// lag behind the provider's notification, use `suiClient.waitForTransaction`
	// instead to poll until the digest is available.
	const txResult = await suiClient.getTransaction({
		digest: payload.transactionDigest,
		include: { balanceChanges: true },
	});

	if (txResult.$kind !== 'Transaction') {
		await complianceLogger.warn('Transaction failed onchain', payload);
		return new Response('Onchain verification failed', { status: 422 });
	}

	// Verify this transaction credited the recipient with the expected amount.
	const recipient = normalizeSuiAddress(payload.recipientAddress);
	const coinType = normalizeStructTag(payload.coinType);
	const received = txResult.Transaction.balanceChanges
		.filter(
			(change) =>
				normalizeSuiAddress(change.address) === recipient &&
				normalizeStructTag(change.coinType) === coinType,
		)
		.reduce((sum, change) => sum + BigInt(change.amount), 0n);

	if (received < BigInt(payload.amount)) {
		await complianceLogger.warn('Webhook does not match onchain state', payload);
		return new Response('Onchain verification failed', { status: 422 });
	}

	// Step 3: Update application state.
	await ledger.creditUser(payload.userId, payload.amount, payload.coinType);

	return new Response('OK', { status: 200 });
}
// docs::/#webhook-handler

export { handleProviderWebhook };
