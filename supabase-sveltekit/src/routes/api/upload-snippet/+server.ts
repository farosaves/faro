import type { SupabaseClient } from '$lib/first';
import { logIfError, ts } from '$lib/util.js';
import { error, json } from '@sveltejs/kit';
import { FSRS, Card } from 'fsrs.js';
import { is2short, makeCloze, makeQuote as makeQuote } from './fun';


export async function POST({ request, locals }) {
	const { selectedText, contextText, website_url, website_title } = await request.json();
	console.log('uploaded:', { selectedText, contextText });
	const supabase: SupabaseClient = locals.supabase; // here this loads defined tables properly
	// console.log((await locals.getSession())?.user.email)
	const quote = makeQuote(selectedText,contextText);
	const { data } = await supabase
		.from("notes")
		.insert({ quote, origin_website: website_url, website_title })
		.select()
		.maybeSingle()
		.then(logIfError);

	return json({data});
}
