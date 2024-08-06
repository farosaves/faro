<script lang="ts">
  import { altKey } from "shared"
  import pin from "$lib/assets/pin.png"
  import { onMount } from "svelte"
  export let data
  let email: string | undefined = undefined
  onMount(async () => {
    const sess = await data.supabase.auth.getSession()
    email = sess.data.session?.user.email
    window.umami.track("loggedInWelcome", { email })
    // document.body.onkeydown = onkeydown
  })
  // const onkeydown = "(e) => console.log(e.altKey)"
  // ;("(e) => e.altKey && e.code == 'KeyD' && umami.track('altD', { email, sel: window.getSelection()?.toString() })")
</script>

<svelte:head>
  <title>Faro - Welcome</title>
</svelte:head>

<!-- <svelte:window
  on:keydown={(e) =>
    e.altKey &&
    e.code == "KeyX" &&
    window.umami.track("altD", { email, sel: window.getSelection()?.toString() })} /> -->

<div class="hero h-screen-minus-80">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="py-8 text-5xl font-bold">Welcome onboard!</h1>
      {#if !email}
        <h2 class="pt-8 text-xl font-semibold">
          <a href="/account/login" target="_blank" class="btn btn-sm btn-primary">Log in</a><br />
          If you want to sync
        </h2>
        <p class="pb-8 font-medium">
          Or just use it with the <span class="tooltip underline" data-tip="Open with {altKey} + C"
            >in-extension dashboard</span>
        </p>
      {:else}
        <p class="py-8 text-xl font-semibold">You're logged in ✅</p>
      {/if}

      <!-- <p class="py-2">
        Highlight this sentence and save with <kbd class="kbd">{altKey}</kbd> +
        <kbd class="kbd">X</kbd>
      </p> -->
      <!-- <p class="py-2">
        Now highlight this sentence, save it, then this <i class="font-semibold">word</i> and save again. It'll
        highlight that word inside your save.
      </p> -->
      <!-- <p class="py-2">Double click your save in the panel on the right to get back to it.</p>
      <p class="py-2">
        Also find it on the dashboard, open it with <kbd class="kbd">{altKey}</kbd> +
        <kbd class="kbd">C</kbd>
      </p>
      <p class="py-2">Double clicking them on the dashboard also takes you back.</p>
      {#if !email}
        <p class="py-2">
          You can make an account whenever you're ready.<br />
          Until then, the dashboard on the website here won't work - only the in-extension one.
        </p>
      {/if} -->
      <!-- <p class="py-2">Other ways to save are using the (right-click) context menu...</p> -->
      <div class="collapse my-2 border hover:text-primary border-primary">
        <input type="checkbox" />
        <div class="collapse-title text-center font-semibold p-4">Recommended: pin the extension</div>
        <div class="collapse-content mx-4 text-base-content">
          Here's how you pin it so the icon stays on top:
          <img alt="Pin extension" src={pin} />
        </div>
      </div>
    </div>
  </div>
</div>
