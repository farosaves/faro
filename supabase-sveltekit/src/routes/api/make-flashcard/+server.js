import { error, json } from '@sveltejs/kit';
import { REPLICATE_API_TOKEN } from '$env/static/private';

import Replicate from "replicate";

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

export async function POST({ request }) {
	const { n_deletions, prompt } = await request.json();
	
	const output = await replicate.run(
		"mistralai/mixtral-8x7b-instruct-v0.1",  // tomasmcm/solar-10.7b-instruct-v1.0:5f53237a53dab757767a5795f396cf0a638fdbe151faf064665d8f0fb346c0f9
		{
			input: {
			  prompt,
			  prompt_format: "<s>[INST] {prompt} [/INST] "
			}
		  }
		);
	// let output = 1;

	return json({output});
}

