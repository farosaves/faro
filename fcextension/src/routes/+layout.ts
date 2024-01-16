export const prerender = true;

import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import type { Database } from '$lib/dbtypes';
// /** @type {import('./$types').Pa} */
export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			async get(name) {
				if (!isBrowser()) {
					return; // (await chrome.cookies.get({url, name})).value
				}

				const cookie = parse(document.cookie);
				return cookie[name];
			}
		}
	});
	let a = await supabase.from('snippets').select('*');

	const {
		data: { session }
	} = await supabase.auth.getSession();
	return { supabase, session };
};
