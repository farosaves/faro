import { writable } from "svelte/store"
import { option as O, array as A } from "fp-ts"
import type { Action } from "svelte/action"
import type { Note } from "./sync/note"
import { persisted } from "./sync/persisted-store"

export const modalOpenStore = writable(false)
export const modalSub: Action<HTMLDialogElement> = (modal) => {
  const unsub = modalOpenStore.subscribe(n => n && modal.showModal())
  return { destroy: unsub }
}
export const tagModalOpenStore = writable(false)

export const windowActive = writable(false)

export const modalNote = writable<O.Option<Note>>(O.none)

let nToast = 0
export const toastStore = writable<[string, number][]>([])
export const activeLoadsStore = writable<number>(0)
export const toastNotify = (msg: string, delay = 2000) => {
  toastStore.update(A.append([msg, nToast += 1]))
  setTimeout(() => toastStore.update(A.dropLeft(1)), delay)
}

export const hasExtensionStore = writable(false)

export const requestedSync = persisted("requestedSync", false)
export const requestedImport = persisted("requestedImport", false)
