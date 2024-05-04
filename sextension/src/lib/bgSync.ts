import { NoteDeri, type SyncLike, type SyncLikeNStores } from "shared"
import { RemoteStore } from "./chromey/messages"
import { NoteMut } from "./note_mut"
import type { AppRouter } from "../background"
import type { createTRPCProxyClient } from "@trpc/client"

type BgSync = SyncLike & Pick<NoteMut, "panels"> & Pick<NoteDeri, "allTags">

export const getBgSync = (t: ReturnType<typeof createTRPCProxyClient<AppRouter>>): BgSync => ({
  allTags: RemoteStore("allTags", []),
  panels: RemoteStore("panels", new Map()),
  tagChange: nid => xs => t.tagChange.mutate([nid, xs]),
  changePrioritised: nid => p => t.changePrioritised.mutate([nid, p]),
  deleteit: nid => t.deleteit.mutate(nid),
  tagUpdate: (...xs) => t.tagUpdate.mutate(xs),
  undo: () => t.undo.query(),
  redo: () => t.redo.query(),
})

// TODO: possibly merge them..

export const getSyncLikeNStores = (t: ReturnType<typeof createTRPCProxyClient<AppRouter>>): SyncLikeNStores => ({
  ...getBgSync(t),
  noteStore: RemoteStore("noteStore", new Map()),
  stuMapStore: RemoteStore("stuMapStore", new Map()),
})
