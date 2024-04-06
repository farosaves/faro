export const ssr = false
import type { UUID } from "crypto"
import type { PageServerLoad } from "./$types"
import type { Notes, Src } from "shared"
type STUMap = Map<UUID, Src>

export const load: PageServerLoad = async ({ locals, url }) => {
  // redirect(302, "/login")
  const ids = [0, 0, 0, 0, 0].map(_ => crypto.randomUUID())
  const stuMap: STUMap = new Map([
    [ids[0], { title: "Hey you!", url: url.origin + "/login" }],
    [ids[1], { title: "Tips", url: url.origin }],
    [ids[2], { title: "Kalanchoe - Wikipedia", url: "https://en.wikipedia.org/wiki/Kalanchoe" }],
    [ids[3], { title: "Also check out!", url: url.origin + "/ext.zip" }],
    [ids[4], { title: "Contact", url: url.origin + "/random/mail-redirect" }],
  ])
  console.log(stuMap)
  let id = 0
  const defs = () => ({
    user_id: "",
    id: (id += 1).toString(),
    created_at: (100 - id).toString(),
    highlights: [],
    context:
        "If this was a normal save, here you would see more context i.e. a few sentences before and after the one you saved.",
    context_html: "",
    predicted_topic: "",
    serialized_highlight: "",
    snippet_uuid: "",
    user_note: "",
    prioritised: 0,
  })
  const mocknoteArr: Notes[] = [
    {
      source_id: ids[0],
      quote: "You're not logged in! Double click me!",
      tags: ["!!!"],
      ...defs(),
      highlights: ["not logged in!"],
    },
    {
      source_id: ids[1],
      quote: "You can play around with the tags.\nAdd one clicking below",
      tags: [],
      ...defs(),
    },
    {
      source_id: ids[1],
      quote: "the tags you've added will appear just above",
      tags: ["tip"],
      ...defs(),
    },
    {
      source_id: ids[1],
      quote: "clicking them will toggle display of tagged elements",
      tags: ["tip"],
      ...defs(),
    },
    {
      source_id: ids[2],
      quote:
          "This links to a wikipedia page about a plant. Normally content of a note would be a snippet taken from the page.",
      tags: ["plants"],
      ...defs(),
    },
    {
      source_id: ids[3],
      quote: "The chrome extension! To save stuff. I'll add it to marketplace soon..",
      tags: [],
      ...defs(),
      highlights: ["chrome extension"],
    },
    {
      source_id: ids[3],
      quote: "and the search bar on the left.",
      tags: ["features"],
      ...defs(),
    },
    // {
    //   source_id: ids[4],
    //   quote: "for any reason",
    //   tags: [],
    //   ...defs(),
    // },
  ]
  const notes: Map<UUID, Notes> = new Map(mocknoteArr.map((n) => {
    const id = crypto.randomUUID()
    return [id, { ...n, id }]
  }))
  return { mock: { notes, stuMap } }
}
