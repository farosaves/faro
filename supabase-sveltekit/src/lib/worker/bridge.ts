import { get, writable, type Readable, type Writable } from "svelte/store"
import * as devalue from "devalue"
import type { WorkerMessage } from "./types"

/**
 * Worker side: Pushes store updates to the main thread
 */
export const exposeStore = <T>(id: string, store: Readable<T>, postMessage: (msg: WorkerMessage) => void) => {
  store.subscribe(value => {
    postMessage({
      type: "STORE_UPDATE",
      storeId: id,
      value: devalue.stringify(value)
    })
  })
}

/**
 * Main thread side: Creates a store that is kept in sync with the worker
 */
export const createRemoteStore = <T>(id: string, init: T, postMessage: (msg: WorkerMessage) => void) => {
  const store = writable<T>(init)
  
  const handleMessage = (msg: WorkerMessage) => {
    if (msg.type === "STORE_UPDATE" && msg.storeId === id) {
      store.set(devalue.parse(msg.value))
    }
  }

  // Request initial value
  postMessage({ type: "STORE_START", storeId: id })

  return {
    store,
    handleMessage
  }
}

