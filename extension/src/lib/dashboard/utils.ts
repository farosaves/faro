import type { Note } from "$lib/sync/note"

export const note2Url = (n: Note) => n.url

export const gotoFunction = (nd: Note | undefined) => () => {
  if (nd === undefined) return
  const url = note2Url(nd)
  url && open(url)
}
