// lib/trpc/context.ts
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

export async function createContext(event: RequestEvent) {
	return {
		locals: event.locals
	};
}

export type Context = inferAsyncReturnType<typeof createContext>;
