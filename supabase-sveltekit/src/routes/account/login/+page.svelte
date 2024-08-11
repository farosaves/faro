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

  const customAppearance = {
    button: "",
  }
  let darkTheme = true
  onMount(() => {
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        if (session) $sessStore = O.some(session)
        setTimeout(() => /\/account\//.test(get(page).url.pathname) && goto("/dashboard?from=login"), 50) // TODO: here should scroll down
      }
    })
    // TODO: this is a hack to make the theme work
    const html = document.querySelector("html")
    if (html) darkTheme = html.classList.contains("dark")
  })
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
      appearance={{
        theme: ThemeSupa,
        style: {
          button: "border-radius: 20px",
          input: "border-radius: 20px",
        },
        variables: {
          default: {
            colors: {
              brand: "oklch(var(--p))",
              brandAccent: "oklch(var(--ac))",
              inputText: "oklch(var(--bc))",
              brandButtonText: "oklch(var(--pc))",
              // messageText: "oklch(var(--b))",
              dividerBackground: "oklch(var(--n))",
              // inputLabelText: "oklch(var(--n))",
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
