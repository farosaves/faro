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
  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, T.online.query)
  const hasNotes = derived(noteSync.noteStore, (ns) => ns.size > 0)
  let showLoginPrompt = false
  const extId = DEBUG ? "iigdnlokbommcbpkhlafbkhgpbmeagfl" : "???"

  onMount(async () => {
    // console.log("slug", slug)
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
    if (sess) await noteSync.setUser_id(sess.user.id) // refreshes
    showLoginPrompt = O.isNone($sessStore)
    // at the end so np if fails
    // should it be here or at which page?
    // if (sess) await chrome.runtime.sendMessage(extId, { action: "key", key: "??", user_id: sess.user.id })
  })
</script>

<!-- <button class="btn" on:click={() => {}}>ref</button> -->
<svelte:window
  on:focus={noteSync.refresh}
  on:focus={() => ($windowActive = true)}
  on:blur={() => ($windowActive = false)} />
<LoginPrompt {showLoginPrompt} hasNotes={$hasNotes} />

<Dashboard {noteSync} />
