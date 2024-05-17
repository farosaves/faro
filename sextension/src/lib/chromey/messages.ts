import type { PendingNote } from "shared"
import type { UUID } from "crypto"
import { getMessage } from "@extend-chrome/messages"
import * as devalue from "devalue"

type Constr<T> = (value: [T, chrome.runtime.MessageSender]) => void
export const gmWrap = <T>(s: string) => {
  const [send, stream, wait] = getMessage<T>(s)
  return { send, stream, wait, sub: <A extends Constr<T>>(f: A) => stream.subscribe(f) }
}

export const gmDvWrap = <T>(s: string) => {
  const [_send, _stream, _wait] = getMessage<string>(s)
  const send = (a: T, options?: SendOptions) => _send(devalue.stringify(a), options)
  const wait = (predicate?: (x: T) => boolean) => _wait(predicate === undefined ? undefined : x => predicate(devalue.parse(x) as T))
  const sub = <A extends Constr<T>>(f: A) => _stream.subscribe(([str, snd]) => f([devalue.parse(str) as T, snd]))
  return { send, wait, sub }
}

export const optimisticNotes = gmWrap<PendingNote>("optimisticNotes")
// export const sharedNotes = gmWrap<Notes>("sharedNotes")

// export const checkGoto = gmWrap<void>("checkGoto")
// export const gotoNoSuccess = gmWrap<boolean>("gotoNoSuccess")
export const yo = gmWrap<boolean>("gotoNoSuccess")

export const getHighlightedText = gmWrap<UUID>("getHighlightedText")
export const gotoSnippetMsg = gmWrap<UUID>("gotoSnippet")
export const deleteSnippetMsg = gmWrap<UUID>("deleteSnippet")

// export const loadDeps = gmWrap<void>("load deps")

import { get, writable, type Readable } from "svelte/store"
import type { SendOptions } from "@extend-chrome/messages/types/types"

type SharedStores = "currSrcs" | "panels" | "needsRefresh" | "session" | "allTags" | "noteStore" | "stuMapStore"

export const pushStore = <T>(id: SharedStores, store: Readable<T>, idStart?: string, errCb = () => {}) => {
  const _idStart = idStart ?? id + "__start"
  const msg = gmDvWrap<T>(id)
  store.subscribe(async x => await msg.send(x).catch(errCb))
  const start = gmWrap<void>(_idStart)
  start.sub(() => msg.send(get(store)))
}

export const RemoteStore = <T>(id: SharedStores, init: T, idStart = id + "__start") => {
  const store = writable(init)
  const msg = gmDvWrap<T>(id)
  msg.sub(([v, _sender]) => store.set(v))
  const start = gmWrap<void>(idStart)
  start.send()
  return store
}
