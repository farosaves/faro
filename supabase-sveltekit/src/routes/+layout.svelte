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

<footer class="footer place-content-between p-4 bg-base-300 text-base-content">
  <!-- <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">yo</nav> -->
  <!-- yo -->
  <aside>© 2024 - Pawel Paradysz</aside>
  <nav class="flex">
    <a class="underline" href="/legal/tos">Terms of Service</a>
    <a class="underline" href="/legal/privacy">Privacy Policy</a>
  </nav>
  <aside>
    <p>Made using <a href="https://jam-icons.com/" class="underline">Jam icons</a></p>
  </aside>
</footer>
