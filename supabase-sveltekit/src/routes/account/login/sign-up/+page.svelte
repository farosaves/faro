<script lang="ts">
  import { ThemeSupa } from "@supabase/auth-ui-shared"
  import { Auth } from "@supabase/auth-ui-svelte"
  export let data
  import { onMount } from "svelte"

  onMount(() => {
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
    <Auth
      {supabaseClient}
      redirectTo={`${data.url}/auth/callback?view=sign_up`}
      showLinks={false}
      providers={["google", "github"]}
      view="magic_link"
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
    <div class="divider"></div>
    <a href="/account/login" class="underline">Already have an account? Sign in</a>
  </div>
</div>
