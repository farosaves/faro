import type { SyncLikeNStores } from "shared"
import { createRemoteStore } from "./bridge"
import type { SyncWorkerAPI, WorkerMessage, WorkerResponse } from "./types"

export const createWorkerSync = (worker: Worker): SyncLikeNStores & { 
  setUser_id: (userId: string | undefined, sbConfig: { url: string, key: string }) => Promise<void>,
  refresh: () => Promise<void>,
  hardReset: () => Promise<void>
} => {
  const pendingRequests = new Map<string, { resolve: (val: any) => void, reject: (err: any) => void }>()

  worker.onmessage = (e: MessageEvent<WorkerResponse | WorkerMessage>) => {
    const data = e.data
    if (data.type === "RPC_RES") {
      const pending = pendingRequests.get(data.id)
      if (pending) {
        if (data.error) pending.reject(new Error(data.error))
        else pending.resolve(data.result)
        pendingRequests.delete(data.id)
      }
    } else if (data.type === "STORE_UPDATE") {
      // These will be handled by the stores created below
    }
  }

  const callWorker = (method: keyof SyncWorkerAPI, args: any[]): Promise<any> => {
    const id = Math.random().toString(36).slice(2)
    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject })
      worker.postMessage({ type: "RPC", method, args, id } as WorkerMessage)
    })
  }

  const { store: noteStore, handleMessage: handleNoteStore } = createRemoteStore("noteStore", new Map(), msg => worker.postMessage(msg))
  const { store: stuMapStore, handleMessage: handleStuMapStore } = createRemoteStore("stuMapStore", new Map(), msg => worker.postMessage(msg))

  // Intercept store messages
  const originalOnMessage = worker.onmessage
  worker.onmessage = (e: MessageEvent<any>) => {
    handleNoteStore(e.data)
    handleStuMapStore(e.data)
    if (originalOnMessage) originalOnMessage(e)
  }

  return {
    noteStore,
    stuMapStore,
    tagChange: (nid) => (tags) => callWorker("tagChange", [nid, tags]),
    tagUpdate: (oldTag, newTag, allTags) => callWorker("tagUpdate", [oldTag, newTag, allTags]),
    changePrioritised: (nid) => (p) => callWorker("changePrioritised", [nid, p]),
    deleteit: (nid) => callWorker("deleteit", [nid]),
    undo: () => callWorker("undo", []),
    redo: () => callWorker("redo", []),
    setUser_id: (userId, sbConfig) => callWorker("setUser_id", [userId, sbConfig]),
    refresh: () => callWorker("refresh", []),
    hardReset: () => callWorker("hardReset", []),
    setOnline: (online) => callWorker("setOnline", [online]),
  }
}

