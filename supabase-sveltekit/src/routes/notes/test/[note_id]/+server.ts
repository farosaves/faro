import { trpc } from "$lib/trpc/client"
import * as cheerio from "cheerio/lib/slim"
import { API_ADDRESS } from "shared"


const T = trpc({ url: { origin: API_ADDRESS } })
export const GET = async ({ params }) => {
  const { note_id } = params
  const { data, error } = await T.singleNote.query(note_id)
  // const myString = (data?.quote) ? `window.location.href = "${data.url.split("#")[0]}#:~:text=${encodeURIComponent(data.quote)}"` : ""
  const pageUrl = data?.url
  if (!pageUrl) return new Response(JSON.stringify(error))
  const $ = cheerio.load(await (await fetch(pageUrl)).text())
  const domain = pageUrl.split(/(?<=\w)\//)[0]
  const isLocal = (s: string) => {
    const t = /^\/\w/ // starts: / character
    return t.test(s)
  }
  // const domain = new URL(pageUrl).host

  for (const module of ["/rangy/rangy-core.min.js", "/rangy/rangy-classapplier.min.js", "/rangy/rangy-highlighter.min.js", "/applierOptions.js"])
    $("head").append(`<script src="${module}"></script>`)
  // dom.window.document.head.appendChild(JSDOM.fragment("<script src=\"/deserializer.js\" type=\"module\"></script>"))
  // dom.window.document.head.appendChild(JSDOM.fragment(`<script></script>`))
  const id = "iigdnlokbommcbpkhlafbkhgpbmeagfl" // https://developer.chrome.com/docs/extensions/develop/concepts/messaging?hl=en#external-webpage
  $("head").append(
  `<script type="module">
    import {deserialize, gotoText} from "/deserializer.js"
    let loaded = false
    
    const f = () => {
      if (!loaded) {
        loaded = true
        // try {

        // } catch {
        deserialize(applierOptions)(["${data.snippet_uuid}", "${data.serialized_highlight?.replace("\"", "\\\"").trim()}"])
        gotoText("${data.snippet_uuid}")  
        // }
      }
    }
    window.addEventListener("load", f)
    setTimeout(f, 500)
  </script>`)
  $("head").prepend(`<meta property="og:image" content="${API_ADDRESS}/preview.png"/>`) // ! hack
  $("head>[href]").each((i, e) => isLocal(e.attribs["href"]) ? !!(e.attribs["href"] = domain + e.attribs["href"]).length : true)
  $("body [src]").each((i, e) => isLocal(e.attribs["src"]) ? !!(e.attribs["src"] = domain + e.attribs["src"]).length : true)
  $("body [srcset]").each((i, e) => isLocal(e.attribs["srcset"]) ? !!(e.attribs["srcset"] = domain + e.attribs["src"]).length : true)

  return new Response($.html(), { headers: { "Content-Type": "text/html" } })
}


