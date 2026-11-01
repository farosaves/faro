/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/svelte" />

// Iterator helpers (Iterator.prototype.toArray, Chrome 122+ / Node 22+) are missing from the TS 5.4 lib.
interface IterableIterator<T> {
  toArray(): T[]
}
interface Generator<T, TReturn, TNext> {
  toArray(): T[]
}
