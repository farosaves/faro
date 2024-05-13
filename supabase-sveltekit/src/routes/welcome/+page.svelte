<script>
  import { altKey } from "shared"
</script>

<svelte:head>
  <title>Faros - Welcome</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="py-2 text-5xl font-bold">Welcome onboard!</h1>
      <h2 class="py-2 text-3xl font-bold">Try it out</h2>
      <p class="py-2">
        Highlight this sentence (triple clicking) and save with <kbd class="kbd">{altKey}</kbd> +
        <kbd class="kbd">D</kbd>
      </p>
      <p class="py-2">Highlight this <i>word</i> and save again.</p>
      <p class="py-2">Double click your saves in the panel on the right to get back to them.</p>

      <p class="py-2">
        Also find them on the dashboard, open it with <kbd class="kbd">{altKey}</kbd> +
        <kbd class="kbd">F</kbd>
      </p>
      <p class="py-2">
        They'll upload to the cloud once you: <a href="/login" class="py-2 btn btn-primary">Log in</a>
      </p>
      <p class="py-2">
        You can make an account whenever you're ready.<br />
        Until then, the dashboard on the website here won't work - only the in-extension one.
      </p>
    </div>
  </div>
</div>
