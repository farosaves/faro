import type { Session } from "@supabase/supabase-js"
import { derived, writable } from "svelte/store"
import { option as O } from "fp-ts"

export const modalOpenStore = writable(false)

const _sess: O.Option<Session> = O.none

export const sessStore = writable(_sess)
type ColorScheme = "light" | "dark"

const colorScheme: ColorScheme = "dark"
export const themeStore = writable<ColorScheme>(colorScheme)
export const replacer = derived(themeStore,
  t => (capture: string) => `<b class="${t == "dark" ? "text-yellow-100" : ""}">` + capture + "</b>")

const a = ""
export const updateTheme = () =>
  themeStore.set(
    window.getComputedStyle(document.documentElement).getPropertyValue("color-scheme") as ColorScheme)

export const modalStore = writable("")
