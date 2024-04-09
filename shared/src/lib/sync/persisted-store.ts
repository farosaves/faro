import { writable as internal, type Writable } from "svelte/store"
import { option as O, either as E } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { ArgType } from "$lib/semaphore"
import { get, set } from "idb-keyval"
import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate"

declare type Updater<T> = (value: T) => T
declare type StoreDict<T> = { [key: string]: Writable<T> }

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Stores {
  local: StoreDict<any>
  session: StoreDict<any>
  indexedDB: StoreDict<any>
}

const stores: Stores = {
  local: {},
  session: {},
  indexedDB: {},
}

export interface Serializer<T> {
  parse(text: string): T
  stringify(object: T): string
}

export type StorageType = "local" | "session" | "indexedDB"

export interface Options<T> {
  serializer?: Serializer<T>
  storage?: StorageType
  syncTabs?: boolean
  onError?: (e: unknown) => void
}
function getStorage(type: StorageType) {
  if (type == "indexedDB") {
    // const setItem = (key: string, val: string) => chrome.storage.local.set(Object.fromEntries([[key, val]]))
    // const getItem = (key: string) => chrome.storage.local.get(key).then(x => x[key] as string | undefined)
    const setItem = (key: string, val: string) => set(key, compressSync(strToU8(val)))
    const getItem = (key: string) => get(key).then(decompressSync).then(strFromU8)

    return { setItem, getItem }
  }
  return type === "local" ? localStorage : sessionStorage
}

export function persisted<T>(key: string, initialValue: T, options?: Options<T>): Writable<T> {
  const serializer = options?.serializer ?? JSON
  const storageType = options?.storage ?? "indexedDB"
  const syncTabs = options?.syncTabs ?? true
  const onError = options?.onError ?? (e => console.error(`Error when writing value from persisted store "${key}" to ${storageType}`, e))
  const browser = (typeof (window) !== "undefined" && typeof (document) !== "undefined") || storageType == "indexedDB"
  const storage = browser ? getStorage(storageType) : null

  async function updateStorage(key: string, value: T) {
    try {
      await storage?.setItem(key, serializer.stringify(value))
    } catch (e) {
      onError(e)
    }
  }

  async function maybeLoadInitial(): Promise<O.Option<T>> {
    return pipe(await storage?.getItem(key),
      E.fromNullable("not present key: " + key),
      E.chain(data => E.tryCatch(() => serializer.parse(data), x => x?.toString() || "unknown error")),
      E.mapLeft(console.log),
      O.fromEither)
  }

  // whole init
  if (!stores[storageType][key]) {
    // const initial: T = await maybeLoadInitial()
    const store = internal(initialValue, (set) => {
      if (browser && storageType == "local" && syncTabs) {
        const handleStorage = (event: StorageEvent) => {
          if (event.key === key)
            set(event.newValue ? serializer.parse(event.newValue) : null)
        }

        window.addEventListener("storage", handleStorage)

        return () => window.removeEventListener("storage", handleStorage)
      } else if (storageType == "indexedDB" && syncTabs) {
        type T = ArgType<typeof chrome.storage.onChanged.addListener>[0]
        const handleStorage: T = (changes, namespace) => {
          for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
            // console.log(
            //   // `Storage key "${key}" in namespace "${namespace}" changed.`,
            //   // `Old value was "${oldValue}", new value is "${newValue}".`,
            // )
          }
        }
        chrome.storage.onChanged.addListener(handleStorage)
        return () => chrome.storage.onChanged.removeListener(handleStorage)
      }
    })

    const { subscribe, set } = store
    maybeLoadInitial().then(O.map(set))

    stores[storageType][key] = {
      set(value: T) {
        set(value)
        updateStorage(key, value) // .then(() => console.log("updated", key, value))
      },
      update(callback: Updater<T>) {
        return store.update((last) => {
          const value = callback(last)

          updateStorage(key, value) // .then(() => console.log("updated", key, value))

          return value
        })
      },
      subscribe,
    }
  }

  return stores[storageType][key]
}
