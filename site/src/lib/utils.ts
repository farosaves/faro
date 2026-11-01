import { writable } from "svelte/store"

export const SITE_URL = "https://farosaves.com"
export const WEB_STORE_URL = "https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo"

export const scrolled = writable(0)

/** Sync tailwind's `dark` class with the colour scheme of the active daisyUI theme. */
export const updateTheme = () => {
  if (window.getComputedStyle(document.documentElement).getPropertyValue("color-scheme") == "dark")
    document.documentElement.classList.add("dark")
  else document.documentElement.classList.remove("dark")
}
