import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import z from 'zod';
import { array as A } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

export const t = initTRPC.context<Context>().create();

export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
	}),

	funsum: t.procedure.input(z.array(z.number())).query(async ({ input }) =>
		pipe(
			input,
			A.reduce(0, (a, b) => a + b)
		)
	)
});

export type Router = typeof router;
