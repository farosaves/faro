import type { NoteEx } from "$lib/db/typeExtras"

export const gotoFunction = (nd: NoteEx | undefined) => () => {
  if (nd === undefined) return
  const url = new URL(nd.url)
  nd.snippet_uuid && (url.hash = "_" + nd.snippet_uuid)
  url && open(url)
}
