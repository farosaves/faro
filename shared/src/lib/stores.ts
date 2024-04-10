import type { Session } from "@supabase/supabase-js"
import { derived, writable } from "svelte/store"
import { option as O, array as A } from "fp-ts"
import type { Action } from "svelte/action"
import type { Notes } from "./db/types"

export const modalOpenStore = writable(false)
export const modalSub: Action<HTMLDialogElement> = (modal) => {
  const unsub = modalOpenStore.subscribe(n => n && modal.showModal())
  return { destroy: unsub }
}


const _sess: O.Option<Session> = O.none

export const sessStore = writable(_sess)
type ColorScheme = "light" | "dark"

const colorScheme: ColorScheme = "dark"
export const themeStore = writable<ColorScheme>(colorScheme)
export const replacer = derived(themeStore,
  t => (capture: string) => `<b class="${t == "dark" ? "text-yellow-100" : ""}">` + capture + "</b>")

export const updateTheme = () =>
  themeStore.set(
    window.getComputedStyle(document.documentElement).getPropertyValue("color-scheme") as ColorScheme)

export const modalNote = writable<O.Option<Notes>>(O.none)

let nToast = 0
export const toastStore = writable<[string, number][]>([])
export const toastNotify = (msg: string) => {
  toastStore.update(A.append([msg, nToast += 1]))
  setTimeout(() => toastStore.update(A.dropLeft(1)), 2000)
}
