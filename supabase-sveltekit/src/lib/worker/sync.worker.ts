import { NoteSync } from "shared"
import { createClient } from "@supabase/supabase-js"
import { exposeStore } from "./bridge"
import type { SyncWorkerAPI, WorkerMessage, WorkerResponse } from "./types"

let noteSync: NoteSync | undefined
let supabase: any

// Track online status from main thread
let isOnline = false

const ctx: any = self

ctx.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  if (msg.type === "STORE_START") {
    if (noteSync) {
      if (msg.storeId === "noteStore") exposeStore("noteStore", noteSync.noteStore, ctx.postMessage.bind(ctx))
      if (msg.storeId === "stuMapStore") exposeStore("stuMapStore", noteSync.stuMapStore, ctx.postMessage.bind(ctx))
    }
    return
  }

  if (msg.type === "RPC") {
    const { method, args, id } = msg
    
    try {
      if (method === "setUser_id") {
        const [userId, sbConfig] = args
        if (!supabase && sbConfig) {
          supabase = createClient(sbConfig.url, sbConfig.key)
        }
        if (!noteSync && supabase) {
          noteSync = new NoteSync(supabase, undefined, async () => isOnline)
        }
        if (noteSync) {
          await noteSync.setUser_id(userId)
          // Expose stores once initialized if they were requested
          exposeStore("noteStore", noteSync.noteStore, ctx.postMessage.bind(ctx))
          exposeStore("stuMapStore", noteSync.stuMapStore, ctx.postMessage.bind(ctx))
        }
        ctx.postMessage({ type: "RPC_RES", id, result: undefined } as WorkerResponse)
      } else if (method === "setOnline") {
        isOnline = args[0]
        ctx.postMessage({ type: "RPC_RES", id, result: undefined } as WorkerResponse)
      } else if (noteSync && method in noteSync) {
        // @ts-ignore
        const result = await (noteSync[method] as Function)(...args)
        ctx.postMessage({ type: "RPC_RES", id, result } as WorkerResponse)
      } else if (method === "refresh") {
         if (noteSync) await noteSync.refresh()
         ctx.postMessage({ type: "RPC_RES", id, result: undefined } as WorkerResponse)
      } else if (method === "hardReset") {
         if (noteSync) await noteSync.hardReset()
         ctx.postMessage({ type: "RPC_RES", id, result: undefined } as WorkerResponse)
      } else {
        throw new Error(`Method ${String(method)} not found on NoteSync`)
      }
    } catch (error: any) {
      ctx.postMessage({ type: "RPC_RES", id, error: error.message } as WorkerResponse)
    }
  }
}

