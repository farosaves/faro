import type { NoteEx } from "$lib/sync/note"
import type { Note } from "$lib/sync/note"
import { hasExtensionStore } from "$lib/stores"
import { API_ADDRESS } from "$lib/utils"
import { get } from "svelte/store"

export const note2Url = (n: Note) => n.url

export const gotoFunction = (nd: NoteEx | undefined) => () => {
  if (nd === undefined) return
  const hasExt = get(hasExtensionStore)
  let url: URL | string
  if (hasExt) url = note2Url(nd)
  else url = API_ADDRESS + "/" + nd.id
  url && open(url)
}
