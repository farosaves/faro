/**
 * a little helper that is written for convenience so that instead
 * of calling `const { data: { session } } = await supabase.auth.getSession()`
 * you just call this `await getSession()`
 */
const DOMAIN = 'http://localhost:5173';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/gotrue-js';
import type { Database } from '$lib/dbtypes';

export let getSession = async (supabase: SupabaseClient) => {
	let resp = await fetch(`${DOMAIN}/api/my-email`, {
		// TODO: rename endpoint
		method: 'POST',
		credentials: 'include',
		headers: {
			Accept: 'application/json'
		}
	});
	const { access_token, refresh_token } = await resp.json();
	// set session
	await supabase.auth.setSession({ access_token, refresh_token });

	const {
		data: { session }
	} = await supabase.auth.getSession();
	return session;
};
