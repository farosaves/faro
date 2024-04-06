<script lang="ts">
  import { option as O } from "fp-ts"
  import { supabase, type Session } from "$lib/chromey/bg"
  import { RemoteStore } from "$lib/chromey/messages"
  import { Dashboard, NoteSync, sessStore } from "shared"
  import { getSyncLikeNStores } from "$lib/bgSync"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "../background"
  import { chromeLink } from "trpc-chrome/link"
  const session = RemoteStore("session", O.none as O.Option<Session>)
  sessStore.set($session)
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port })],
  })

  const noteSync = getSyncLikeNStores(TB)
  noteSync.noteStore.subscribe((s) => console.log("updated remote noteStore", s.size))
  // session.subscribe(O.map((sess) => noteSync.setUser_id(sess.user.id)))

  console.log("henlo")
</script>

<!-- <a href="dashboard" class="btn btn-primary">whao</a> -->
<!-- {JSON.stringify($session)} -->
<Dashboard {noteSync} />
