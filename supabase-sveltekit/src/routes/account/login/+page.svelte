<script lang="ts">
  import { ThemeSupa, type ViewType } from "@supabase/auth-ui-shared"
  import { Auth } from "@supabase/auth-ui-svelte"
  export let data
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import { DEBUG, sessStore } from "shared"
  import { option as O } from "fp-ts"
  import { page } from "$app/stores"
  import { get } from "svelte/store"

  onMount(() =>
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        if (session) $sessStore = O.some(session)
        setTimeout(() => /\/account\//.test(get(page).url.pathname) && goto("/account?from=login"), 50)
      }
    }),
  )
  $: supabaseClient = data.supabase
</script>

<svelte:head>
  <title>Faros - Login</title>
</svelte:head>

<div class="flex justify-center">
  <div class="w-64">
    <Auth
      {supabaseClient}
      redirectTo={`${data.url}/auth/callback?view=sign_in`}
      showLinks={false}
      providers={["google", "github"]}
      view="sign_in"
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
  </div>
</div>
