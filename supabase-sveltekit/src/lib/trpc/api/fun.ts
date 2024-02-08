import type { SupabaseClient } from '$lib/shared/first';
import { logIfError } from '$lib/shared/utils';
import { json } from '@sveltejs/kit';
import { array as A, option as O } from 'fp-ts';
import { flow } from 'fp-ts/lib/function';
import { split } from 'sentence-splitter';

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


// let tooLong = (s: string) => split(s).filter((s) => s.raw.length > 4).length > 10;
// let longEnough = (s: string) => split(s).filter((s) => s.raw.length > 4).length > 1;
// let good4cloze = (s: string) => s.split(' ').length < 6;
// let isValidQuote = (s: string) => longEnough(s) && !tooLong(s);
// let firstValid = flow(A.findLast(isValidQuote), O.toUndefined); // TODO: this can make problems
// let iou = (s1: string) => (s2: string) =>
// 	new Set(...s1.split(' ').filter((x) => new Set(...s2.split(' ')).has(x))).size /
// 	new Set([...s1.split(' '), ...s2.split(' ')]).size;
// let a = Set(s1), b= Set(s2); length(a ∪ b)/length(a ∩ b) end in julia for comparison lol

// Quote Context Highlights
export async function makeQCH(selectedText: string, html: string, uuid: string) {
	const {q, c, h, error} = await (await fetch('http://localhost:2227/make-qch', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			selectedText,
			html,
			uuid
		})
	})).json();
	error && console.log(error)
	return {quote: q, context: c, highlights: h}
}

export async function supa_update(supabase: SupabaseClient, n: MockNote) {
	let {sources, ...note} = n
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
	return json("hey")
}
