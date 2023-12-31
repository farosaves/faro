import { error, json } from '@sveltejs/kit';
import { REPLICATE_API_TOKEN } from '$env/static/private';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { QA_prompt1, QA_prompt_response1, prompt_response0 } from './prompts';
import { createClient } from '@supabase/supabase-js'

import Replicate from "replicate";

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

// Create a single supabase client for interacting with your database
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

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

export async function POST({ request }, mixtral=false, qa=true) {
	const { n_cards, website_title, text, link, session } = await request.json();
	// console.log()

	// const { data } = await supabase.from('snippets').insert({origin_website: link, snippet_text: text}).select()
	const {data} = await (await fetch('http://127.0.0.1:2227/api/add_snippet', {
		method: 'POST',
		body: JSON.stringify({ origin_website: link, snippet_text: text }),
		headers: {
			'content-type': 'application/json'
		}
	})).json();
	
	console.log(data)
	// let {topic, qas} = qa ? await flashcards_qa(n_cards, website_title, text) : ""
	let qas = [["hey", "ho"]];
	let card_contents = [];
	for (const [front, back] of qas) {
		card_contents.push((await (await fetch('http://127.0.0.1:2227/api/add_card_content', {
			method: 'POST',
			body: JSON.stringify({ front, back, snippet_id: data.id }),
			headers: {
				'content-type': 'application/json'
			}
		})).json()).data);
	}

	return json({qas, snippet_id: data.id, card_content_ids: card_contents.map(x=>x.cardContentId)});
}

