/**
 * a little helper that is written for convenience so that instead
 * of calling `const { data: { session } } = await supabase.auth.getSession()`
 * you just call this `await getSession()`
 */
import { PUBLIC_PI_IP } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';
import { array as A } from 'fp-ts';

export let API_ADDRESS = PUBLIC_PI_IP.replace(/\/$/, '');

export let getSession = async (supabase: SupabaseClient, tokens) => {
	const { access_token, refresh_token } = tokens;
	// set session
	await supabase.auth.setSession({ access_token, refresh_token }).then(logIfError);

	const {
		data: { session }
	} = await supabase.auth.getSession().then(logIfError);
	return session;
};

export let delete_by_id = (id: number) => A.filter((v: { id: number }) => v.id !== id);

export function logIfError<T extends { error: any }>(r: T): T {
	const { error } = r;
	error && console.log('error from logIfError util function\n', error);
	return r;
}
