import { NoteSync, type SyncLike } from "shared"
import type { Readable } from "svelte/store"
import { RemoteStore } from "./chromey/messages"
import { NoteMut } from "./note_mut"
import type { AppRouter } from "../background"
import type { createTRPCProxyClient } from "@trpc/client"

type BgSync = SyncLike & Pick<NoteMut, "panel">

export const getBgSync = (t: ReturnType<typeof createTRPCProxyClient<AppRouter>>): BgSync => ({
  alltags: RemoteStore("allTags", []),
  panel: RemoteStore("panel", []),
  tagChange: nid => (x, xs) => t.tagChange.mutate([nid, x, xs]),
  changePrioritised: nid => p => t.changePrioritised.mutate([nid, p]),
  deleteit: nid => t.deleteit.mutate(nid),
})
