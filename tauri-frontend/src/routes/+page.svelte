<script lang="ts">
  import "../styles.css"
  import { trpc } from "$lib/trpc"
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
  // const extId = DEBUG ? "iigdnlokbommcbpkhlafbkhgpbmeagfl" : "???"

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
    console.log("showLoginPrompt", showLoginPrompt, $sessStore)
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

<div class="text-red-500">{showLoginPrompt}{JSON.stringify($sessStore)}</div>
{#if showLoginPrompt}
  <div role="alert" class="alert alert-error">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Not logged in! <a class="underline" href="/login">Click here</a></span>
  </div>
{/if}

<Dashboard {noteSync} />
