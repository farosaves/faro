<script>
  import { onMount } from "svelte"
  const DOMAIN = "http://localhost:5173"
  export let data
  let { supabase, session } = data
  let email = session ? session.user.email : "none@none"
  onMount(async () => {
    console.log(session)
  })
</script>

Sb: {supabase}<br />
Session: {session}<br />

{email}
