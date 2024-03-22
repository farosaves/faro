import { persisted as _persisted, type Options } from "svelte-persisted-store"
import type { Writable } from "svelte/store"

export const persisted = <T>(key: string, d: T, o?: Options<T>): Writable<T> => {
  try {
    return _persisted(key, d, o)
  } catch {
    localStorage.setItem(key, "")
    return _persisted(key, d, o)
  }
}
