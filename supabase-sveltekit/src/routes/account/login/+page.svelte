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

  onMount(() =>
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        if (session) $sessStore = O.some(session)
        setTimeout(() => /\/account\//.test(get(page).url.pathname) && goto("/dashboard?from=login"), 50)
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
      appearance={{
        theme: ThemeSupa,
        style: {
          button: "border-radius: 20px",
          input: "border-radius: 20px; ",
          //..
        },
      }} />
    <div class=" w-full text-right py-1 pr-1">
      <a
        href="/account/login/forgotten-password"
        class="dark:text-orange-300 text-black text-sm hover:underline">Forgotten password</a>
    </div>
    <div class="dark:text-white text-center text-sm p-3">
      Do not have an account?<br />
      <a href="/account/login/sign-up" class=" text-black dark:text-orange-300 w-full text-md hover:underline"
        >Sign Up</a>
    </div>
    <br />
  </div>
</div>
