import { trpc } from "$lib/trpc/client"
import * as cheerio from "cheerio/lib/slim"
import { API_ADDRESS } from "shared"


const T = trpc({ url: { origin: API_ADDRESS } })
export const GET = async ({ params }) => {
  const { note_id } = params
  const { data, error } = await T.singleNote.query(note_id)
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
    let loaded = false
    const f = () => {
      if (!loaded) {
        loaded = true
        deserialize(applierOptions)(["${data.snippet_uuid}", "${data.serialized_highlight?.replace("\"", "\\\"").trim()}"])
        gotoText("${data.snippet_uuid}")  
      }
    }
    window.addEventListener("load", f)
    setTimeout(f, 500)
  </script>`)
  console.log($("head").html() == a)

  return new Response($.html(), { headers: { "Content-Type": "text/html" } })
}


