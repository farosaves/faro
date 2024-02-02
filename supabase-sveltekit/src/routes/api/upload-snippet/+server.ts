import type { SupabaseClient } from '$lib/first';
import { logIfError } from '$lib/shared/utils.js';
import { error, json } from '@sveltejs/kit';
import { makeQCH } from './fun';

let hostname = (s: string) => new URL(s).hostname;

export async function POST({ request, locals }) {
	const { selectedText, html, website_url, website_title, uuid, serialized } =
		await request.json();
	const supabase: SupabaseClient = locals.supabase; // here this loads defined tables properly
	console.log('uploaded:', { selectedText, html });
	const { quote, highlights, context } = await makeQCH(selectedText, html, uuid);
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
	if (!quote) return json({});
	console.log(serialized, quote)
	
	await supabase
		.from('notes')
		.insert({ quote, source_id, highlights, context, snippet_uuid: uuid, serialized_highlight: serialized})
		.then(logIfError);
	return json({});
}
