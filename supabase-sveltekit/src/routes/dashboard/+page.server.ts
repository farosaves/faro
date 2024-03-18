export const ssr = false
import type { PageServerLoad } from "./$types"
import type { Notes } from "shared"
import { z } from "zod"
const validateSTUMap = z.record(z.number(), z.object({ title: z.string(), url: z.string() })).parse
type STUMap = ReturnType<typeof validateSTUMap>

export const load: PageServerLoad = async ({ locals, url }) => {
  const sess = await locals.getSession()
  if (sess == null) {
    // redirect(302, "/login")
    const stuMap: STUMap = {
      "0": { title: "Hey you!", url: url.origin + "/login" },
      "1": { title: "Tips", url: url.origin },
      "2": { title: "Kalanchoe - Wikipedia", url: "https://en.wikipedia.org/wiki/Kalanchoe" },
      "3": { title: "Also check out!", url: url.origin + "/ext.zip" },
      "4": { title: "Contact", url: url.origin + "/random/mail-redirect" },
    }
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
    })
    const mocknoteArr: Notes[] = [
      {
        source_id: "0",
        quote: "You're not logged in! Double click me!",
        tags: ["!!!"],
        ...defs(),
        highlights: ["not logged in!"],
      },
      {
        source_id: "1",
        quote: "You can play around with the tags.\nAdd one clicking below",
        tags: [],
        ...defs(),
      },
      {
        source_id: "1",
        quote: "the tags you've added will appear just above",
        tags: ["tip"],
        ...defs(),
      },
      {
        source_id: "1",
        quote: "clicking them will toggle display of tagged elements",
        tags: ["tip"],
        ...defs(),
      },
      {
        source_id: "2",
        quote:
          "This links to a wikipedia page about a plant. Normally content of a note would be a snippet taken from the page.",
        tags: ["plants"],
        ...defs(),
      },
      {
        source_id: "3",
        quote: "The chrome extension! To save stuff. I'll add it to marketplace soon..",
        tags: [],
        ...defs(),
        highlights: ["chrome extension"],
      },
      {
        source_id: "3",
        quote: "and the search bar on the left.",
        tags: ["features"],
        ...defs(),
      },
      {
        source_id: "4",
        quote: "for any reason",
        tags: [],
        ...defs(),
      },
    ]
    const notes: Record<number, (typeof mocknoteArr)[0]> = {}
    mocknoteArr.forEach((n, i) => (notes[i] = n))
    return { mock: { notes, stuMap } }
  }
}
