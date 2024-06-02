<script lang="ts">
  import { ThemeSupa, type ViewType } from "@supabase/auth-ui-shared"
  import { Auth } from "@supabase/auth-ui-svelte"
  export let data
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  let view: ViewType = "sign_in"
  import { DEBUG, sessStore } from "shared"
  import { option as O } from "fp-ts"
  import { page } from "$app/stores"
  import { get } from "svelte/store"

  onMount(() => {
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        if (session) $sessStore = O.some(session)
        setTimeout(() => /\/account\//.test(get(page).url.pathname) && goto("/account?from=login"), 50)
      }
    })
    const a = Array.from(document.getElementsByClassName("supabase-auth-ui_ui-button"))
      .filter((x) => x.textContent == "Send Magic Link")
      .at(0)
    if (a) a.textContent = "Send Confimation Mail"
  })
  $: supabaseClient = data.supabase
</script>

<svelte:head>
  <title>Faros - Sign Up</title>
</svelte:head>

<div class="flex justify-center">
  <div class="w-64">
    <!-- border-dotted border-gray-500 border-2 -->
    <Auth
      {supabaseClient}
      redirectTo={`${data.url}/auth/callback?view=${view}`}
      showLinks={false}
      providers={["google", "github"]}
      view="magic_link"
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
    <!-- <Auth supabaseClient={data.supabase} {view} {providers} /> -->
    <!-- <Radio options={view_options} bind:userSelected={view} /> -->
  </div>
</div>
