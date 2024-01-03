import { error, json } from '@sveltejs/kit';
import { REPLICATE_API_TOKEN } from '$env/static/private';
import { QA_prompt1, QA_prompt_response1, prompt_response0 } from './prompts';
import {FSRS, Card} from "fsrs.js"

import Replicate from "replicate";

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

async function flashcards_qa(n_cards, website_title, text, mixtral=false) {
	let prompt_format = `<s>[INST] {prompt} [/INST] ${prompt_response0()}`
	let prompt = QA_prompt1(n_cards, website_title, text)
	let prompt_full = `<s>### User:
	${prompt}
	
	### Assistant: 
	${QA_prompt_response1()}`;

	(mixtral) ? console.log(prompt, prompt_format) : console.log(prompt_full)
	const output = await replicate.run(
		mixtral ? "mistralai/mixtral-8x7b-instruct-v0.1" : 
		"tomasmcm/solar-10.7b-instruct-v1.0:5f53237a53dab757767a5795f396cf0a638fdbe151faf064665d8f0fb346c0f9",
		{
			input: mixtral ? {prompt, prompt_format} : {
			  prompt: prompt_full
			}
		  }
		);
	console.log(output)

	let lines = output.split("\n");
	let topic = lines[0];
	let numre = /^\d{1,2}\.\s/;
	let qas = lines.slice(1).map((str) => {
		return str.replace(numre, "").split(" - ");
	  });
	qas = qas.filter(t => Array.isArray(t) && t.length == 2)

	return {topic, qas}
}

// Would it make sense to split out this logic? 
// My first intuition is no - because you always want to have snippet, title, website may be null
async function add_card(front, back, snippet_id, locals) {
	let fsrs = new FSRS();
	let card = new Card();
	card = fsrs.repeat(card, new Date())[1].card
	let card_content = (await locals.supabase.from('card_contents').insert({front, back, snippet_id}).select().maybeSingle()).data
	let saved_card = (await locals.supabase.from('cards').insert({card_content_id: card_content.id, ...card}).select().maybeSingle()).data
	return saved_card
}

export async function POST({ request, locals }, mixtral=false, qa=true) {
	const { n_cards, website_title, text, link } = await request.json();
	const { data } = await locals.supabase.from('snippets').insert({origin_website: link, snippet_text: text}).select().maybeSingle()

	console.log(data)
	let qas = [["hey", "ho"]];
	let cards = [];
	for (const [front, back] of qas) {
		cards.push(await add_card(front, back, data.id, locals));
	}
	console.log(cards)
	return json({qas, snippet_id: data.id, card_ids: cards.map(x=>x.id)});
}

