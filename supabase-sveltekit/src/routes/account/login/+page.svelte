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

  onMount(() => {
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        if (session) $sessStore = O.some(session)
        setTimeout(() => /\/account\//.test(get(page).url.pathname) && goto("/dashboard?from=login"), 50) // TODO: here should scroll down
      }
    })
  })
  $: supabaseClient = data.supabase
</script>

<svelte:head>
  <title>Faro - Login</title>
</svelte:head>

<div class="flex justify-center h-screen-minus-240">
  <div class="w-64 my-4">
    <Auth
      {supabaseClient}
      redirectTo={`${data.url}/auth/callback?view=sign_in`}
      showLinks={false}
      providers={["google", "github"]}
      view="sign_in"
      appearance={{
        theme: ThemeSupa,
        style: {
          button: "border-radius: 1rem",
          input: "border-radius: 1rem",
        },
        variables: {
          default: {
            colors: {
              brand: "oklch(var(--p))",
              brandAccent: "oklch(var(--p)/0.9)",
              inputText: "oklch(var(--bc))",
              brandButtonText: "oklch(var(--pc))",
              dividerBackground: "oklch(var(--n))",
              defaultButtonText: "oklch(var(--n))",
              anchorTextColor: "oklch(var(--p))",
            },
          },
        },
      }} />
    <div class="w-full text-right py-1 pr-1">
      <a href="/account/login/forgotten-password" class="dark:text-yellow-100 text-sm hover:underline"
        >Forgotten password</a>
    </div>
    <div class="text-center text-sm p-3">
      Do not have an account?<br />
      <a href="/account/login/sign-up" class=" dark:text-yellow-100 w-full text-base hover:underline"
        >Sign Up</a>
    </div>
    <br />
  </div>
</div>
