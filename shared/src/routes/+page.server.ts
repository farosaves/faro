export const ssr = false
import type { UUID } from "crypto"
import type { PageServerLoad } from "./$types"
import { type Notes, type Src } from "$lib"
import { map as M } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import sb from "@supabase/supabase-js"
const { SupabaseClient: SbClient } = sb
type STUMap = Map<UUID, Src>

export const load: PageServerLoad = async ({ locals, url }) => {
  const ids = [0, 0, 0, 0, 0].map(_ => crypto.randomUUID())
  const stuMap: STUMap = pipe(new Map([
    [ids[0], { title: "Hey YC!", url: url.origin + "/account/login" }],
    [ids[1], { title: "Tips", url: url.origin }],
    [ids[2], { title: "Kalanchoe - Wikipedia", url: "https://en.wikipedia.org/wiki/Kalanchoe" }],
    [ids[3], { title: "Also check out!", url: url.origin + "/ext.zip" }],
    [ids[4], { title: "Contact", url: url.origin + "/mail" }],
  ]), M.map(t => ({ ...t, domain: t.url })))
  console.log(stuMap)
  let id = 0
  const defs = (n: number) => ({
    user_id: "",
    id: (id += 1).toString(),
    created_at: (100 - id).toString(),
    updated_at: (100 - id).toString(),
    highlights: [],
    context:
        "If this was a normal save, here you would see more context i.e. a few sentences before and after the one you saved.",
    predicted_topic: "",
    serialized_highlight: "",
    snippet_uuid: "",
    user_note: "",
    prioritised: 0,
    source_id: ids[n],
    url: stuMap.get(ids[n])!.domain,
    referer: null,
  })
  const kalId = "99b504bd-652a-44fc-b8d3-3450f78169ce"
  const kal
     = ({
       quote:
        "This links to a wikipedia page about a plant. Normally content of a note would be a snippet taken from the page.",
       tags: ["plants"],
       ...defs(2) })

  const mocknoteArr: Notes[] = [
    {
      quote: "Use the login credentials from the application! Double click me for login",
      tags: ["!!!"],
      ...defs(0),
      highlights: ["click me"],
    },
    {
      quote: "You can play around with the tags.\nAdd one clicking below",
      tags: [],
      ...defs(1),
    },
    {
      quote: "the tags you've added will appear above",
      tags: ["tip"],
      ...defs(1),
    },
    {
      quote: "clicking them will toggle display of tagged elements",
      tags: ["tip"],
      ...defs(1),
    },
    // kal,
    {
      quote: "The chrome extension (not yet on marketplace)",
      tags: [],
      ...defs(3),
      highlights: [],
    },
    {
      quote: "and the search bar on the left.",
      tags: ["features"],
      ...defs(3),
    },
    {
      quote: "for any reason",
      tags: [],
      ...defs(4),
    },
  ]
  const notes: Map<UUID, Notes> = new Map(mocknoteArr.map((n) => {
    const id = crypto.randomUUID()
    return [id, { ...n, id }]
  }))
  //   const supabase = new SbClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY) as SupabaseClient
  return { mock: { notes, stuMap } }
}
