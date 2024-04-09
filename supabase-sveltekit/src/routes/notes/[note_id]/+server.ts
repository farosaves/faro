import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SERVICE_ROLE_KEY } from "$env/static/private"
import type { Database } from "shared"
import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio/lib/slim"

const sb = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)

export const GET = async ({ params }) => {
  const { note_id } = params
  const { data, error } = await sb.from("notes").select("*, sources (url)").eq("id", note_id).single()
  const pageUrl = data?.sources?.url
  if (!pageUrl) return new Response(JSON.stringify(error))
  // console.log("sess", await sb.auth.getSession())
  const $ = cheerio.load(await (await fetch(pageUrl)).text())

  for (const module of ["/rangy/rangy-core.min.js", "/rangy/rangy-classapplier.min.js", "/rangy/rangy-highlighter.min.js", "/applierOptions.js"])
    $("head").append(`<script src="${module}"></script>`)
  // dom.window.document.head.appendChild(JSDOM.fragment("<script src=\"/deserializer.js\" type=\"module\"></script>"))
  // dom.window.document.head.appendChild(JSDOM.fragment(`<script></script>`))
  const a = $("head").html()
  $("head").append(
  `<script type="module">
    import {deserialize, gotoText} from "/deserializer.js"
    window.addEventListener("load", () => {
      console.log(["${data.snippet_uuid}", "${data.serialized_highlight?.replace("\"", "\\\"").trim()}"])
      deserialize(applierOptions)(["${data.snippet_uuid}", "${data.serialized_highlight?.replace("\"", "\\\"").trim()}"])
      gotoText("${data.snippet_uuid}")
    })
  </script>`)
  console.log($("head").html() == a)

  return new Response($.html(), { headers: { "Content-Type": "text/html" } })
}


