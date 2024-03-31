import { REPLICATE_API_TOKEN } from "$env/static/private"
import { json } from "@sveltejs/kit"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
})

const prompt = `England manager Sarina Wiegman has said she has "unfinished business" after signing a new contract until 2027.

Former Netherlands player and manager Wiegman started the role in September 2021 and guided the team to a first major trophy when they won Euro 2022.

England also reached the 2023 World Cup final, which they lost to Spain.`

const systemPrompt = `You are a helpful assistant designed to output json responses.
Users will provide you with a string.
I would like you to create a flashcard out of it.
The flashcard is composed of two text strings.
One contains the answer, so to speak, the other should be the input rewritten as a question.
I don't want you to create an image, but use an LLM to create text.
Your answer should contain two fields: 1. Question. 2. Answer.
Do not provide an intro paragraph. Just the Question and Answer.
`
export async function GET({ request, locals }) {
  let sess = await locals.getSession()
  if (sess) {
    console.log("Running 70bn model")
    let then = Date.now()
    const output = await replicate.run(
      "meta/llama-2-70b-chat:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48",
      {
        input: {
          debug: false,
          top_p: 1,
          prompt: prompt,
          temperature: 0.5,
          system_prompt: systemPrompt,
          max_new_tokens: 500,
          min_new_tokens: -1,
        },
      },
    )
    // @ts-ignore
    const res = output.join("")
    console.log(res)
    console.log(`Llama 70bn took ${(Date.now() - then) / 1000} seconds`)
    console.log("Running 7bn model")
    then = Date.now()

    const output2 = await replicate.run(
      "meta/llama-2-7b-chat:f1d50bb24186c52daae319ca8366e53debdaa9e0ae7ff976e918df752732ccc4",
      {
        input: {
          top_p: 1,
          prompt: prompt,
          temperature: 0.75,
          system_prompt: systemPrompt,
          max_new_tokens: 800,
          repetition_penalty: 1,
        },
      },
    )

    console.log({ output2 })
    // @ts-ignore
    const res2 = output2.join("")
    console.log({ res2 })
    console.log(`LLama 7bn took ${(Date.now() - then) / 1000} seconds`)
    return json({
      status: 200,
      body: "done",
    })
  } else {
    console.log("User not logged in")
    return json({})
  }
}
