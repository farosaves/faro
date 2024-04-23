<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../styles.css"
  import { goto, invalidate } from "$app/navigation"
  import { onMount } from "svelte"
  import Navbar from "$lib/components/Navbar.svelte"

  export let data

  let { supabase } = data
  $: ({ supabase } = data)

  onMount(() => {
    supabase.auth.onAuthStateChange((event, _session) => {
      // if (_session?.expires_at !== session?.expires_at) {
      //   invalidate("supabase:auth")
      // }
      if (event === "SIGNED_OUT")
        setTimeout(() => {
          goto("/")
        }, 50)
    })
  })
</script>

<Navbar />
<div>
  <slot />
</div>

<!-- <footer class="footer footer-center p-4 bg-base-300 text-base-content">
  <aside>
    <p>Copyright © 2024 - All right reserved by ACME Industries Ltd</p>
  </aside>
</footer> -->
