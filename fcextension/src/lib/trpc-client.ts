// lib/trpc/client.ts
import { PUBLIC_PI_IP } from '$env/static/public';
import type { Router } from '../../../supabase-sveltekit/src/lib/trpc/router';
import { httpBatchLink } from '@trpc/client';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';

let browserClient: ReturnType<typeof createTRPCClient<Router>>;

export function trpc(init?: TRPCClientInit) {
	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && browserClient) return browserClient;
	const client = createTRPCClient<Router>({
		init,
		links: [
			httpBatchLink({
				url: PUBLIC_PI_IP + '/trpc' // this works even though warns
			})
		]
	});
	if (isBrowser) browserClient = client;
	return client;
}
