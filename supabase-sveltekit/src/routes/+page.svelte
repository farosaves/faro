<script>
  import { altKey, funLog, hasExtensionStore, replacer } from "shared"
  import { onMount } from "svelte"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  // let extInstalled = true
  onMount(async () => {
    // failed to fetch if not installed
    fetch("chrome-extension://pdndbnolgapjdcebajmgcehndggfegeo/icon.svg")
      .then((r) => hasExtensionStore.set(true))
      .catch(() => undefined)
  })
</script>

<svelte:head>
  <title>Faros - Save online reading - bookmark highlights</title>
  <meta
    name="description"
    content="Save web pages for later with Faros browser extension. Highlight, save & organize. " />
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-300">
  <div class="hero flex-grow">
    <div class="hero-content text-center">
      <div class="flex flex-col w-full place-items-center">
        <div class="max-w-md space-y-4">
          <h1 class="text-5xl py-4 mont">{@html $replacer("Faros")}</h1>
          <h2 class="text-3xl font-bold">Save online reading</h2>
          <h3 class="text-2xl font-bold">Remember what you saved and why</h3>
          <!-- <h3 class="text-2xl font-bold">Web bookmarks with taglines</h3> -->
          <!-- <a class="btn btn-primary" href="login">Sign up</a> -->
          <!-- For those who love learning, but have too many interests to keep track of. -->
          {#if !$hasExtensionStore}
            <br />
            <a
              id="farosgetitlink"
              class="btn btn-lg btn-primary text-xl"
              target="_blank"
              data-umami-event="WebStore"
              href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
              <IconLogosChromeWebStore font-size="32" />Get it on chrome store</a>
          {/if}
        </div>

        <!-- <div class="divider"></div>
        yoo -->
        <div class="divider"></div>
        <div class="card bg-base-300 rounded-box place-items-center">
          <p class="py-1">
            Chaos in your bookmarks? <br />Can't find what you want? <br />They end up gathering dust?
          </p>
          <div class="divider">Fix it!</div>
          <p class="py-1">Use Faros to save pages instead.</p>
          <p class="py-1">
            It combines bookmarks with a webclipper <br />so you can pick taglines for the websites you save.
          </p>
          <p class="py-1">Watch the video to learn how:</p>
          <!-- You can check out the <u><b><a href="/dashboard/mock">mock dashboard</a></b></u>
            to see what it looks like
            <br />
            Or  -->
          <!-- Watch the video introduction: -->
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-center w-full my-4">
    <iframe
      loading="lazy"
      width="560"
      height="315"
      src="https://www.youtube.com/embed/aNaLN5J-Ei0?si=CjgEH5kWIckYKKE5"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>
  </div>
  <!-- <div class="card items-center">
    <h3 class="text-2xl font-bold">TL;DW</h3>
    <p class="font-bold">Bookmarks ✕ Web Clipper</p>
    <p>You highlight a snippet to remember the page better.</p>
    <p>Your saves show both the page title and the snippet you picked.</p>
  </div> -->
  <div class="flex flex-col items-center my-16">
    <div class="max-w-lg bg-base-100 rounded-2xl">
      <div class="collapse collapse-arrow">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium text-left">How do I use it?</div>
        <div class="collapse-content mx-4">
          <ul class="list-disc text-nowrap w-min text-left">
            <li class="list-item">Select text</li>
            <li class="list-item">
              Press <kbd class="kbd">{altKey}</kbd> + <kbd class="kbd">X</kbd> <br />
              or right-click and select "Faros save"
            </li>
            <li class="list-item">If something doesn't work try refreshing the webpage.</li>
          </ul>
        </div>
      </div>
      <div class="collapse collapse-arrow">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium text-left">Where is it available?</div>
        <div class="collapse-content">
          It's on <a
            href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo"
            class="underline">chrome webstore</a
          >: for desktops.<br />
          I can do Firefox easily so <a href="/contact" class="underline">lmk if interested</a>.
        </div>
      </div>
      <div class="collapse collapse-arrow">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium text-left">Do I need to sign up?</div>
        <div class="collapse-content">No! It works on your computer without sign up.</div>
      </div>
      <!-- <div class="collapse collapse-arrow">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium text-left">How much does it cost?</div>
        <div class="collapse-content">
          Right now the beta is free. <br />As long as you sign up during beta you'll forever have the option
          to buy lifetime access for $10 on
          <a class="underline" href="https://ko-fi.com/farosapp">kofi</a>.<br />
        </div>
      </div> -->
    </div>
  </div>
</div>
