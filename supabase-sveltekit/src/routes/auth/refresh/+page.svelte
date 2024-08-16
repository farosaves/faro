<script lang="ts">
  import { trpc } from "$lib/trpc/client.js"
  export let data
  const { supabase } = data
  import { onMount } from "svelte"

  const T = trpc()

  onMount(async () => {
    const toks = await T.my_tokens.query()
    if (toks) supabase.auth.setSession(toks)
  })
</script>

YO
