<script lang="ts">
  import LoginPrompt from "$lib/components/LoginPrompt.svelte"
  import { trpc } from "$lib/trpc/client.js"
  import type { Session } from "@supabase/supabase-js"
  export let data
  const { supabase } = data
  import { option as O, taskOption as TO } from "fp-ts"
  import { DEBUG, Dashboard, NoteSync, chainN, funLog, sessStore, windowActive } from "shared"
  import { onMount } from "svelte"
  import { derived, get } from "svelte/store"
  import { createWorkerSync } from "$lib/worker/client"
  import SyncWorker from "$lib/worker/sync.worker?worker"
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"

  const T = trpc()
  
  let noteSync: ReturnType<typeof createWorkerSync>

  onMount(async () => {
    const worker = new SyncWorker()
    noteSync = createWorkerSync(worker)

    const storedSess = get(sessStore)
    let sess: Session | null | undefined
    if (O.isNone(storedSess)) {
      const toks = await T.my_tokens.query({ eagerRefresh: true })
      sess = toks && (await supabase.auth.setSession(toks)).data.session
    } else {
      sess = storedSess.value
    }
    sessStore.set(O.fromNullable(sess))
    DEBUG && console.log(sess)
    if (sess) {
      await noteSync.setUser_id(sess.user.id, { 
        url: PUBLIC_SUPABASE_URL, 
        key: PUBLIC_SUPABASE_ANON_KEY 
      })
      await noteSync.setOnline(await T.online.query().catch(() => false))
    }
    showLoginPrompt = O.isNone($sessStore)
  })

  const hasNotes = derived(noteSync?.noteStore || derived([], () => new Map()), (ns) => ns.size > 0)
  let showLoginPrompt = false
  const extId = DEBUG ? "iigdnlokbommcbpkhlafbkhgpbmeagfl" : "???"
</script>

<!-- <button class="btn" on:click={() => {}}>ref</button> -->
<svelte:window
  on:focus={() => noteSync?.refresh()}
  on:focus={() => ($windowActive = true)}
  on:blur={() => ($windowActive = false)} />
<LoginPrompt {showLoginPrompt} hasNotes={$hasNotes} />

{#if noteSync}
  <Dashboard {noteSync} />
{/if}
