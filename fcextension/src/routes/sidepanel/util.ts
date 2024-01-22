import type { SupabaseClient } from '$lib/first';
import type { functor } from 'fp-ts';
export async function _getNotes(supabase: SupabaseClient, source_id: number, user_id: string) {
	const { data, error } = await supabase
		.from('notes')
		.select()
		.eq('source_id', source_id)
		.eq('user_id', user_id);
	error && console.log('getNotes error', error);
	console.log(data);
	return data ?? [];
}
