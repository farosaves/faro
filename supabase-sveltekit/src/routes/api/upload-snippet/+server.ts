import type { SupabaseClient } from '$lib/first';
import { logIfError } from '$lib/util.js';
import { error, json } from '@sveltejs/kit';
import { is2short, makeQuote } from './fun';

let hostname = (s: string) => new URL(s).hostname;

export async function POST({ request, locals }) {
	const { selectedText, contextText, website_url, website_title } = await request.json();
	console.log('uploaded:', { selectedText, contextText });
	const supabase: SupabaseClient = locals.supabase; // here this loads defined tables properly
	// console.log((await locals.getSession())?.user.email)
	const quote = makeQuote(selectedText, contextText);
	if (contextText.split(' ').length < 2 || selectedText.length < 2) return json({});
	const { data } = await supabase
		.from('sources')
		.select('id')
		.eq('domain', hostname(website_url))
		.eq('title', website_title)
		.maybeSingle();
	let source_id;
	if (data) source_id = data.id;
	else {
		const { data } = await supabase
			.from('sources')
			.insert({ domain: hostname(website_url), url: website_url, title: website_title })
			.select('id')
			.maybeSingle()
			.then(logIfError);
		source_id = data!.id;
	}
	let highlights = is2short(selectedText) ? [selectedText] : [];
	await supabase
		.from('notes')
		.insert({ quote, source_id, highlights, context: contextText })
		.then(logIfError);

	return json({});
}
