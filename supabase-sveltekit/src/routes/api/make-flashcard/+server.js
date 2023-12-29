import { error, json } from '@sveltejs/kit';
import { REPLICATE_API_TOKEN } from '$env/static/private';

import Replicate from "replicate";

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

function make_prompt(website_title, text) { 
	return `I will give you a piece of text which is taken from the website ${website_title}.
	The text is as follows: "${text}"
	Here the text ends.
	First identify the topic that the reader is interested in.
	Then for each sentence we want to have a deletion cloze flashcard where the piece of information is  like this:
	"The World War Two began in the year {{1939}}."
	"The 16th president of the United States was {{Abraham Lincoln}}"
	And they need to follow the specified format.`
}

function prompt_response() {
	return `Here is the topic and the sentences where the information is surrounded by double braces like you specified.\nTopic:`
}

export async function POST({ request }) {
	const { n_deletions, website_title, text } = await request.json();
	let prompt_format = `<s>[INST] {prompt} [/INST] ${prompt_response()}`
	let prompt = make_prompt(website_title, text)
	console.log(prompt, prompt_format)
	
	const output = await replicate.run(
		"mistralai/mixtral-8x7b-instruct-v0.1",  
		// "tomasmcm/solar-10.7b-instruct-v1.0:5f53237a53dab757767a5795f396cf0a638fdbe151faf064665d8f0fb346c0f9",
		{
			input: {
			  prompt,
			  prompt_format
			}
		  }
		);
	// let output = 1;
	console.log(output.join(""))

	return json({output});
}

