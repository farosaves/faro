import { JSDOM } from "jsdom"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SERVICE_ROLE_KEY } from "$env/static/private"
import type { Database } from "shared"
import { createClient } from "@supabase/supabase-js"

const sb = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)

// const sb = new SupabaseClient()

export const GET = async ({ params }) => {
  const { note_id } = params
  const { data, error } = await sb.from("notes").select("*, sources (url)").eq("id", note_id).single()
  console.log(data?.quote, data?.serialized_highlight)
  // console.log("sess", await sb.auth.getSession())
  const pageUrl = data?.sources?.url
  if (!pageUrl) return new Response(JSON.stringify(error))
  const host = pageUrl.match(/https?:\/\/[^/]+(?=\/)/u)![0].toString()
  const dom = await JSDOM.fromURL(pageUrl)
  for (const elem of dom.window.document.querySelectorAll("[src], [srcset], [href]")) {
    for (const attr of ["src", "srcset", "href"]) {
      const oldLink = elem.getAttribute(attr)
      if (oldLink && /^\/\w/.test(oldLink))
        elem.setAttribute(attr, host + oldLink)
    }
  }
  for (const module of ["/rangy/rangy-core.min.js", "/rangy/rangy-classapplier.min.js", "/rangy/rangy-highlighter.min.js", "/applierOptions.js"])
    dom.window.document.head.appendChild(JSDOM.fragment(`<script src="${module}"></script>`))
  // dom.window.document.head.appendChild(JSDOM.fragment("<script src=\"/deserializer.js\" type=\"module\"></script>"))
  // dom.window.document.head.appendChild(JSDOM.fragment(`<script></script>`))
  dom.window.document.head.appendChild(JSDOM.fragment(
  `<script type="module">
    import {deserialize, gotoText} from "/deserializer.js"
    window.addEventListener("load", () => {
      deserialize(applierOptions)(["${data.snippet_uuid}", "${data.serialized_highlight}"])
      gotoText("${data.snippet_uuid}")
    })
  </script>`))

  return new Response(dom.serialize(), { headers: { "Content-Type": "text/html" } })
}


