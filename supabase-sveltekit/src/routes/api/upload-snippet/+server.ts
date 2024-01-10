import type { SupabaseClient } from '$lib/first';
import { logIfError, ts } from '$lib/util.js';
import { error, json } from '@sveltejs/kit';
import { FSRS, Card } from 'fsrs.js';
import { is4Cloze, makeCloze, makeQuote as makeQuote } from './fun';

async function add_card(
	front: string,
	back: string | null,
	note_id: number,
	supabase: SupabaseClient
) {
	let fsrs = new FSRS();
	let card = new Card();
	card = fsrs.repeat(card, new Date())[1].card; // 1 is 'Again'
	let card_content = (
		await supabase.from('card_contents').insert({ front, back, note_id }).select().maybeSingle()
	).data;
	if (!card_content) return null;
	let saved_card = (
		await supabase
			.from('cards')
			.insert({ card_content_id: card_content.id, ...ts(card) })
			.select()
			.maybeSingle()
	).data;
	return saved_card;
}

export async function POST({ request, locals }) {
	const { selectedText, contextText, website_url, website_title } = await request.json();
	console.log('uploaded:', { selectedText, contextText });
	const supabase: SupabaseClient = locals.supabase; // here this loads defined tables properly
	// console.log((await locals.getSession())?.user.email)
	const quote = makeQuote(selectedText,contextText);
	const { data: note } = await supabase
		.from("notes")
		.insert({ quote, origin_website: website_url, website_title })
		.select()
		.maybeSingle()
		.then(logIfError);
	note!.id;
	if (is4Cloze(selectedText)) {
		let { front, back } = makeCloze(selectedText, contextText);
		await add_card(front, back, note!.id, supabase);
	}

	return json({});
}
