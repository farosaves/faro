<script lang="ts">
  import { ThemeSupa } from "@supabase/auth-ui-shared"
  import { Auth } from "@supabase/auth-ui-svelte"
  export let data
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  let emailSent = false

  onMount(() => {
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        emailSent = true
      }
    })
  })

  $: supabaseClient = data.supabase
</script>

<svelte:head>
  <title>Faro - Forgot Password</title>
</svelte:head>

<div class="flex justify-center" style="min-height: calc(100vh - 280px)">
  <div class="w-64 my-4">
    {#if emailSent}
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <h2 class="card-title justify-center">Check your email</h2>
          <p class="text-sm">
            We've sent a magic link to your email address. Click the link in the email to reset your password.
          </p>
          <div class="card-actions justify-center mt-4">
            <a href="/account/login" class="btn btn-primary">Back to Login</a>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center mb-4">
        <h2 class="text-2xl font-bold">Reset Password</h2>
        <p class="text-sm opacity-70 mt-2">
          Enter your email address and we'll send you a magic link to reset your password.
        </p>
      </div>

      <Auth
        {supabaseClient}
        redirectTo={`${data.url}/auth/callback?view=forgotten_password`}
        showLinks={false}
        view="forgotten_password"
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

      <div class="text-center text-sm p-3">
        Remember your password?<br />
        <a href="/account/login" class="dark:text-yellow-100 w-full text-base hover:underline">
          Back to Sign In
        </a>
      </div>
    {/if}
  </div>
</div>
