import type { SyncLike } from "shared"
import type { UUID } from "crypto"

export interface SyncWorkerAPI extends SyncLike {
  setUser_id(user_id: string | undefined, sbConfig?: { url: string, key: string }): Promise<void>
  refresh(): Promise<void>
  hardReset(): Promise<void>
  setOnline(online: boolean): Promise<void>
}

export type WorkerMessage = 
  | { type: "RPC", method: keyof SyncWorkerAPI, args: any[], id: string }
  | { type: "STORE_UPDATE", storeId: string, value: string } // serialized with devalue
  | { type: "STORE_START", storeId: string }

export type WorkerResponse = 
  | { type: "RPC_RES", id: string, result?: any, error?: string }

