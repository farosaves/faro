import type { NoteEx } from "$lib/db/typeExtras"

export const gotoFunction = (nd: NoteEx) => () => {
  const url = new URL(nd.url)
  console.log("title", nd.sources.title)
  nd.snippet_uuid && url.searchParams.set("highlightUuid", nd.snippet_uuid)
  console.log(url)
  url && open(url)
}
