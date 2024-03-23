import type { PendingNote } from "shared"
import type { UUID } from "crypto"
import { getMessage } from "@extend-chrome/messages"

export const gmWrap = <T>(s: string) => {
  type Constr<T> = (value: [T, chrome.runtime.MessageSender]) => void

  const [send, stream, wait] = getMessage<T>(s)
  return { send, stream, wait, sub: <A extends Constr<T>>(x: A) => stream.subscribe(x) }
}

export const pendingNotes = gmWrap<PendingNote>("STATS")

export const getHighlightedText = gmWrap<UUID>("getHighlightedText")
export const gotoSnippetMsg = gmWrap<UUID>("gotoSnippet")
export const deleteSnippetMsg = gmWrap<UUID>("deleteSnippet")

// export const loadDeps = gmWrap<void>("load deps")

import { get, writable, type Readable } from "svelte/store"

type SharedStores = "currSrcMutBg" | "allTags" | "panel" | "needsRefresh"

export const pushStore = <T>(id: SharedStores, store: Readable<T>, idStart?: string, errCb = console.log) => {
  const _idStart = idStart ?? id + "__start"
  const msg = gmWrap<T>(id)
  store.subscribe(async x => await msg.send(x).catch(errCb))
  const start = gmWrap<void>(_idStart)
  start.sub(() => msg.send(get(store)))
}

export const RemoteStore = <T>(id: SharedStores, init: T, idStart = id + "__start") => {
  const store = writable(init)
  const msg = gmWrap<T>(id)
  msg.sub(([v, sender]) => store.set(v))
  const start = gmWrap<void>(idStart)
  start.send()
  return store
}
