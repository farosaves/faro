<script lang="ts">
  import LoginPrompt from "$lib/components/LoginPrompt.svelte"
  import { trpc } from "$lib/trpc/client.js"
  export let data
  const { supabase } = data
  import { option as O, taskOption as TO } from "fp-ts"
  import { pipe } from "fp-ts/lib/function.js"
  import { DEBUG, Dashboard, NoteSync, chainN, sessStore } from "shared"
  import { onMount } from "svelte"
  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, T.online.query)
  let showLoginPrompt = false
  onMount(async () => {
    const toks = await T.my_tokens.query()
    const sessOpt = O.fromNullable(toks && (await supabase.auth.setSession(toks)).data.session)

    sessStore.set(sessOpt)
    DEBUG && console.log(sessOpt)
    if (O.isSome(sessOpt)) await noteSync.setUser_id(sessOpt.value.user.id)
    showLoginPrompt = O.isNone($sessStore)
  })
</script>

<!-- <button class="btn" on:click={() => {}}>ref</button> -->
<LoginPrompt {showLoginPrompt} />
<Dashboard {noteSync} />
