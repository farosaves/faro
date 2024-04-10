// import { OPENAI_SECRET_KEY, REPLICATE_API_TOKEN } from '$env/static/private';
import { REPLICATE_API_TOKEN } from "$env/static/private"
import { json } from "@sveltejs/kit"

import Replicate from "replicate"

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
})

// const openai = new OpenAI({ apiKey: OPENAI_SECRET_KEY });

const systemPrompt = `You are a helpful assistant designed to output json responses.
Users will provide you with a string.
I would like you to create a flashcard out of it.
The flashcard is composed of two text strings.
One contains the answer, so to speak, the other should be the input rewritten as a question.
I don't want you to create an image, but use an LLM to create text.
Your answer should contain two fields: 1. Question. 2. Answer.`

// async function getOpenAICompletion(model, systemPrompt, inputText) {
// 	const completion = await openai.chat.completions.create({
// 		messages: [
// 			{ role: 'system', content: systemPrompt },
// 			{ role: 'user', content: `Here is the input: """${inputText}"""` }
// 		],
// 		model: model,
// 		response_format: { type: 'json_object' }
// 	});

// 	return completion.choices[0].message.content;
// }

async function getLLAMAResponse(model, systemPrompt, inputText) {
  // Call to Replicate API
  const output = await replicate.run(model, {
    input: {
      prompt: inputText,
      system_prompt: systemPrompt,
      // additional parameters as required
    },
  })
  // Process and return the response
  return output.join("")
}

export async function POST({ request, locals }) {
  const sess = await locals.getSession()
  if (sess) {
    const data = await request.json()
    const inputText = data.text
    const model = data.model
    // const completion = await getOpenAICompletion(model, systemPrompt, inputText);
    return json({
      status: 200,
      body: {
        completion: "incomplete;)",
      },
    })
  } else {
    console.log("User not logged in")
    return json({})
  }
}
