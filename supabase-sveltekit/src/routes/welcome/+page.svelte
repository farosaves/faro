<script lang="ts">
  import { altKey } from "shared"
  import pin from "$lib/assets/pin.png"
  import { onMount } from "svelte"
  export let data
  let email: string | undefined = undefined
  onMount(async () => {
    const sess = await data.supabase.auth.getSession()
    email = sess.data.session?.user.email
    umami.track("loggedInWelcome", { email })
  })
</script>

<svelte:head>
  <title>Faros - Welcome</title>
</svelte:head>

<svelte:window
  on:keydown={(e) =>
    e.altKey && e.code == "KeyD" && umami.track("altD", { email, sel: window.getSelection()?.toString() })} />

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="py-2 text-5xl font-bold">Welcome onboard!</h1>
      <h2 class="py-2 text-3xl font-bold">Try it out</h2>
      <p class="py-2">
        Highlight this sentence and save with <kbd class="kbd">{altKey}</kbd> +
        <kbd class="kbd">D</kbd>
      </p>
      <p class="py-2">
        Now highlight this sentence, save it, then this <i class="font-semibold">word</i> and save again. It'll
        highlight that word inside your save.
      </p>
      <p class="py-2">Double click your saves in the panel on the right to get back to them.</p>
      <p class="py-2">
        Also find them on the dashboard, open it with <kbd class="kbd">{altKey}</kbd> +
        <kbd class="kbd">F</kbd>
      </p>
      <p class="py-2">Double clicking them on the dashboard also takes you right back.</p>
      <p class="py-2">
        Your saves will upload to the cloud once you: <a href="/login" class="py-2 btn btn-sm btn-primary"
          >Log in</a>
      </p>
      <p class="py-2">
        You can make an account whenever you're ready.<br />
        Until then, the dashboard on the website here won't work - only the in-extension one.
      </p>
      <p class="py-2">Other ways to save are using the (right-click) context menu...</p>
      <div class="collapse bg-base-100 my-2">
        <input type="checkbox" />
        <div class="collapse-title font-medium text-center p-4">...or clicking the extension icon.</div>
        <div class="collapse-content mx-4">
          Here's how you pin it so the icon stays on top:
          <img alt="The project logo" src={pin} />
        </div>
      </div>
    </div>
  </div>
</div>
