
// import { read } from "$app/server"
// import mht from "./Loading data • Docs • SvelteKit.mht"
// // import goose from "./goose.jpg"

// import * as fs from "fs"
export const GET = async (event) => {
//   const data = fs.readFileSync("./Loading data • Docs • SvelteKit.mht").toString()
  const fetched = await event.fetch("/sveltekit.mht")
  return new Response(await fetched.blob(), { headers: { "Content-Type": fetched.headers.get("Content-Type")! } })
//   return new Response(file)
}

