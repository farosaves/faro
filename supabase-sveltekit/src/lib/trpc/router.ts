import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import z from 'zod';
import { array as A } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

export const t = initTRPC.context<Context>().create();

// unfortunately to have type inference in the extension you need to do it manually
const tokens = z.object({ access_token: z.string(), refresh_token: z.string() });
export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
	}),

	funsum: t.procedure.input(z.array(z.number())).query(async ({ input }) =>
		pipe(
			input,
			A.reduce(0, (a, b) => a + b)
		)
	),
	my_email: t.procedure.output(z.optional(tokens)).query(async ({ ctx: { locals } }) => {
		let sess = await locals.getSession();
		if (sess) {
			const { access_token, refresh_token } = sess;
			return { access_token, refresh_token };
		}
		return;
	})
});

export type Router = typeof router;
