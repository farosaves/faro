import { error, json } from '@sveltejs/kit';
import { REPLICATE_API_TOKEN } from '$env/static/private';
import { QA_prompt1, QA_prompt_response1, prompt_response0 } from './prompts';

import Replicate from "replicate";

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

export async function POST({ request }, mixtral=false, qa=true) {
	const { n_cards, website_title, text } = await request.json();
	let prompt = QA_prompt1(n_cards, website_title, text)
	let prompt_format = `<s>[INST] {prompt} [/INST] ${prompt_response0()}`
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
	// let output = 1;
	console.log(output)

	return json({output});
}

