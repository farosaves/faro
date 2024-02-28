import type { SupabaseClient } from '$lib/shared/first';
import { hostname, logIfError, sleep } from '$lib/shared/utils';
import type { MockNote } from '$lib/utils';

export const supa_update = (schlep=0) => async (supabase: SupabaseClient, n: MockNote) => {
	let { sources, ...note } = n;
	const { data } = await supabase
		.from('sources')
		.select('id')
		.eq('domain', hostname(sources.url))
		.eq('title', sources.title)
		.maybeSingle();
	if (data) note.source_id = data.id;
	else {
		const { data } = await supabase
			.from('sources')
			.insert({ domain: hostname(sources.url), url: sources.url, title: sources.title })
			.select('id')
			.maybeSingle()
			.then(logIfError);
		note.source_id = data!.id;
	}
	const {data: newNote} = await supabase.from('notes').insert(note).select().maybeSingle();
	await sleep(schlep)  // time for sb to update
	return newNote
}
