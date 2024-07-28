<script lang="ts">
  import { ThemeSupa } from "@supabase/auth-ui-shared"
  import { Auth } from "@supabase/auth-ui-svelte"
  export let data
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import { sessStore } from "shared"
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
  // if (ThemeSupa.default.colors) {
  //   ThemeSupa.default.colors.brand = ""
  //   ThemeSupa.default.colors.brandAccent = ""
  // }
</script>

<svelte:head>
  <title>Faro - Login</title>
</svelte:head>

<div class="flex justify-center">
  <div class="w-64 my-4">
    <Auth
      {supabaseClient}
      redirectTo={`${data.url}/auth/callback?view=sign_in`}
      showLinks={false}
      providers={["google", "github"]}
      view="sign_in"
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
    <div class="divider"></div>
    <a href="/account/login/sign-up" class="underline">New user? Sign Up</a><br />
    <a href="/account/login/forgotten-password" class="underline">Forgotten password?</a>
  </div>
</div>
