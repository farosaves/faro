import type { NoteEx } from "$lib/db/typeExtras"
import type { Notes } from "$lib/db/types"
import { hasExtensionStore } from "$lib/stores"
import { API_ADDRESS } from "$lib/utils"
import { get } from "svelte/store"

export const note2Url = (n: Notes) => {
  const url = new URL(n.url)
  n.snippet_uuid && (url.hash = "_" + n.snippet_uuid)
  return url
}

export const gotoFunction = (nd: NoteEx | undefined) => () => {
  if (nd === undefined) return
  const hasExt = get(hasExtensionStore)
  let url: URL | string
  if (hasExt) url = note2Url(nd)
  else url = API_ADDRESS + "/" + nd.id
  url && open(url)
}
