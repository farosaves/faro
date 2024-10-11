import { writable } from "svelte/store"

export const tutorialStep = writable<number | string>(0)

export const getElementByText = (className: string, text: string, nth: number) =>
  Array.from(document.getElementsByClassName(className))
    .filter(x => x.textContent?.includes(text))
    .at(nth)

