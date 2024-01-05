<script>
  import { onMount } from "svelte";
  import { getSupabase, url } from "$lib/utils.ts";
  let supabase;
  let email = "none@none";
  onMount(async () => {
    let r = await fetch(`${url}/api/my-email`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
    let data = await r.json();
    console.log(data);
    email = data.email;
  });
</script>

AA
{email}
