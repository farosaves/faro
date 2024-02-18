import type { SupabaseClient } from "$lib/shared/first";
import { ts } from "$lib/utils";
import { Card, FSRS } from "fsrs.js";

export async function add_card(s: {
	front: string | null,
	back: string | null,
	note_id: number,
	supabase: SupabaseClient
}) {
    const {supabase, ...card_data} = s
	const fsrs = new FSRS();
	let card = new Card();
	card = fsrs.repeat(card, new Date())[1].card; // 1 is 'Again'
	const card_content = (
		await supabase.from('card_contents').insert(card_data).select().maybeSingle()
	).data;
	if (!card_content) return null;
	const saved_card = (
		await supabase
			.from('cards')
			.insert({ card_content_id: card_content.id, ...ts(card) })
			.select()
			.maybeSingle()
	).data;
	return saved_card;
}
