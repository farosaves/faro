import type { NoteEx } from "$lib/db/typeExtras"
import type { Notes } from "$lib/db/types"

export const note2Url = (n: Notes) => {
  const url = new URL(n.url)
  n.snippet_uuid && (url.hash = "_" + n.snippet_uuid)
  return url
}

export const gotoFunction = (nd: NoteEx | undefined) => () => {
  if (nd === undefined) return
  const url = note2Url(nd)
  url && open(url)
}
