<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../styles.css";
  import { goto, invalidate } from "$app/navigation";
  import { onMount } from "svelte";
  import Navbar from "$lib/components/Navbar.svelte";

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
      if (event == "SIGNED_IN")
        setTimeout(() => {
          goto("/account");
        }, 50);
      else if (event === "SIGNED_OUT")
        setTimeout(() => {
          goto("/");
        }, 50);
    });

    return () => data.subscription.unsubscribe();
  });
</script>

<svelte:head>
  <title>Faros</title>
</svelte:head>

<Navbar />
<div>
  <slot />
</div>
