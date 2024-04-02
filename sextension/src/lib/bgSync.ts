import { NoteDeri, NoteSync, type SyncLike, type SyncLikeNStores } from "shared"
import { RemoteStore } from "./chromey/messages"
import { NoteMut } from "./note_mut"
import type { AppRouter } from "../background"
import type { createTRPCProxyClient } from "@trpc/client"

type BgSync = SyncLike & Pick<NoteMut, "panel"> & Pick<NoteDeri, "alltags">

export const getBgSync = (t: ReturnType<typeof createTRPCProxyClient<AppRouter>>): BgSync => ({
  alltags: RemoteStore("allTags", []),
  panel: RemoteStore("panel", []),
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
