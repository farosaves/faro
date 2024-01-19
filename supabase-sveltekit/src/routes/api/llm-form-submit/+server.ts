import { OPENAI_SECRET_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import Replicate from 'replicate';

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN
});

const openai = new OpenAI({ apiKey: OPENAI_SECRET_KEY });

const systemPrompt = `You are a helpful assistant designed to output json responses.
Users will provide you with a string.
I would like you to create a flashcard out of it.
The flashcard is composed of two text strings.
One contains the answer, so to speak, the other should be the input rewritten as a question.
I don't want you to create an image, but use an LLM to create text.
Your answer should contain two fields: 1. Question. 2. Answer.`;

async function getOpenAICompletion(model, systemPrompt, inputText) {
	const completion = await openai.chat.completions.create({
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: `Here is the input: """${inputText}"""` }
		],
		model: model,
		response_format: { type: 'json_object' }
	});

	return completion.choices[0].message.content;
}

export async function POST({ request, locals }) {
	let sess = await locals.getSession();
	if (sess) {
		const data = await request.json();
		const inputText = data.text;
		const completionGPT3 = await getOpenAICompletion('gpt-3.5-turbo-1106', systemPrompt, inputText);
		const completionGPT4 = await getOpenAICompletion('gpt-4-1106-preview', systemPrompt, inputText);

		return json({
			status: 200,
			body: {
				gpt3Response: completionGPT3,
				gpt4Response: completionGPT4
			}
		});
	}
	return json({});
}
