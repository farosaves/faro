import type { SupabaseClient } from '$lib/shared/first';
import { logIfError } from '$lib/shared/utils';
import { json } from '@sveltejs/kit';

let hostname = (s: string) => new URL(s).hostname;

export type MockNote = {
	quote: string;
	source_id: number;
	highlights: string[];
	context: string;
	snippet_uuid: string;
	serialized_highlight: string;
	sources: { title: string; url: string };
};

export async function supa_update(supabase: SupabaseClient, n: MockNote) {
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
	await supabase.from('notes').insert(note).then(logIfError);
	return json('hey');
}
