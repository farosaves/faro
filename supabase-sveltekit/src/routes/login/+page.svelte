<script lang="ts">
  import { ThemeSupa, type ViewType } from "@supabase/auth-ui-shared"
  import { Auth } from "@supabase/auth-ui-svelte"
  export let data
  import Radio from "$lib/Radio.svelte"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  let view: ViewType = "sign_in"
  let view_options = ["sign_in", "sign_up", "magic_link", "forgotten_password"]
  import { DEBUG, sessStore } from "shared"
  import { option as O } from "fp-ts"
  import type { SupabaseClient } from "@supabase/supabase-js"
  import { page } from "$app/stores"
  import { get } from "svelte/store"

  onMount(() =>
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        DEBUG && console.log(session)
        if (session) $sessStore = O.some(session)
        setTimeout(() => {
          DEBUG && console.log("url", $page.url.pathname) // omfg $page binds immediately, and get(page) on call
          get(page).url.pathname == "/login" && goto("/account?from=login")
        }, 50)
      }
    }),
  )
  $: supabaseClient = data.supabase as unknown as SupabaseClient
</script>

<svelte:head>
  <title>Faros - Login</title>
</svelte:head>

<div class="flex justify-center">
  <div class="w-64">
    <!-- border-dotted border-gray-500 border-2 -->
    <Auth
      {supabaseClient}
      redirectTo={`${data.url}/auth/callback?view=${view}`}
      showLinks={false}
      view={view == "sign_up" ? "magic_link" : view}
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
    <!-- <Auth supabaseClient={data.supabase} {view} {providers} /> -->
    <Radio options={view_options} bind:userSelected={view} />
  </div>
</div>
