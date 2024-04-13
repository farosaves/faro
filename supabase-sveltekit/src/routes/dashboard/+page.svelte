<script lang="ts">
  import LoginPrompt from "$lib/components/LoginPrompt.svelte"
  import { trpc } from "$lib/trpc/client.js"
  export let data
  const { supabase } = data
  import { option as O } from "fp-ts"
  import { DEBUG, Dashboard, NoteSync, sessStore } from "shared"
  import { onMount } from "svelte"
  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, T.online.query)
  // console.log(session?.user.id)
  // console.log(noteSync.noteStore)
  let showLoginPrompt = false
  // noteSync.noteStore.subscribe((n) => console.log(n))
  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    sessStore.set(O.fromNullable(session))
    DEBUG && console.log(session)
    if (session) await noteSync.setUser_id(session.user.id)
    showLoginPrompt = O.isNone($sessStore)
  })
</script>

<button class="btn" on:click={() => {}}>ref</button>
<LoginPrompt {showLoginPrompt} />
<Dashboard {noteSync} />
