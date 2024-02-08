import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import z from 'zod';
import { array as A } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { makeQCH, supa_update, type MockNote } from './api/fun';
import { json } from '@sveltejs/kit';

export const t = initTRPC.context<Context>().create();

// unfortunately to have type inference in the extension you need to do it manually
const tokens = z.object({ access_token: z.string(), refresh_token: z.string() });
const uploadinput = z.object({
	selectedText: z.string(),
	html: z.string(),
	website_title: z.string(),
	website_url: z.string(),
	uuid: z.string(),
	serialized: z.string()
});
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
	}),
	upload_snippet: t.procedure.input(uploadinput).mutation(async ({ input, ctx: { locals } }) => {
		const { selectedText, html, website_url, website_title, uuid, serialized } = input;
		console.log('uploaded:', { selectedText, html });
		const { quote, highlights, context } = await makeQCH(selectedText, html, uuid);
		if (!quote) return {data: null};
		const note_data: MockNote = {
			quote,
			source_id: -1,
			highlights,
			context,
			snippet_uuid: uuid,
			serialized_highlight: serialized,
			sources: { title: website_title, url: website_url }
		};
		// supa_update(locals.supabase, note_data).then(console.log);
		return { data: note_data };
	})
});

export type Router = typeof router;
