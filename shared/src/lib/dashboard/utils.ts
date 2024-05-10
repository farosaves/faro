import type { NoteEx } from "$lib/db/typeExtras"

export const gotoFunction = (nd: NoteEx) => () => {
  const url = new URL(nd.url)
  nd.snippet_uuid && url.searchParams.set("highlightUuid", nd.snippet_uuid)
  url && open(url)
}
