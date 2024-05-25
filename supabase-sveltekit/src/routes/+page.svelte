<script>
  import { highlight } from "fuzzysort"
  import { altKey, funLog, replacer } from "shared"
  import { onMount } from "svelte"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  let extInstalled = true
  onMount(async () => {
    // failed to fetch if not installed
    fetch("chrome-extension://pdndbnolgapjdcebajmgcehndggfegeo/icon.svg").catch(
      (r) => (extInstalled = r.message != "Failed to fetch"),
    )
  })
</script>

<svelte:head>
  <title>Faros - Stay on top of online reading - bookmark highlights</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-300">
  <div class="hero flex-grow">
    <div class="hero-content text-center">
      <div class="flex flex-col w-full place-items-center">
        <div class="max-w-md space-y-4">
          <h1 class="text-5xl py-4 mont">{@html $replacer("Faros")}</h1>
          <h2 class="text-4xl font-bold">Stay on top of online reading <br /> Bookmark highlights</h2>
          <!-- <a class="btn btn-primary" href="login">Sign up</a> -->
          <br />
          {#if !extInstalled}
            <a
              id="farosgetitlink"
              class="btn btn-lg btn-primary text-xl"
              target="_blank"
              data-umami-event="WebStore"
              href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
              <IconLogosChromeWebStore font-size="32" />Get it on chrome store</a>
          {/if}
        </div>

        <div class="divider"></div>
        <div class="grid h-20 card bg-base-300 rounded-box place-items-center">
          <p class="py-1">
            <!-- You can check out the <u><b><a href="/dashboard/mock">mock dashboard</a></b></u>
            to see what it looks like
            <br />
            Or  -->
            Watch the video introduction:
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-center w-full">
    <iframe
      loading="lazy"
      width="560"
      height="315"
      src="https://www.youtube.com/embed/1E8DST6DRSg?si=-z_Cg4lEEuuqzcPv"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>
  </div>
  <div class="my-8"></div>
  <div class="flex flex-col items-center">
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="collapse collapse-arrow bg-base-100 max-w-lg" tabindex="0">
      <div class="collapse-title text-xl font-medium text-left">Why would I need it?</div>
      <div class="collapse-content">
        <span class="my-2 block"
          >Imagine you're browsing and you come across something you want to be able to go back to later...</span>
        <span class="my-2 block"
          >You could for example: keep the tab open, bookmark, copy the url to notion/obsidian etc.</span>
        <span class="my-2 block">Or use Faros: it's designed to make revisiting as easy as possible.</span>
      </div>
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="collapse collapse-arrow bg-base-100 max-w-lg" tabindex="0">
      <div class="collapse-title text-xl font-medium text-left">How do I use it?</div>
      <div class="collapse-content mx-4">
        <ul class="list-disc text-nowrap w-min text-left">
          <li class="list-item">Select text</li>
          <li class="list-item">
            Press <kbd class="kbd">{altKey}</kbd> + <kbd class="kbd">D</kbd> <br />
            or right-click and select "Faros save"
          </li>
          <li class="list-item">
            If something doesnt work try refreshing the extension <br />
            With the 🔄 icon in the top right of the sidebar.
          </li>
        </ul>
      </div>
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="collapse collapse-arrow bg-base-100 max-w-lg" tabindex="0">
      <div class="collapse-title text-xl font-medium text-left">Where is it available?</div>
      <div class="collapse-content">
        It's on chrome webstore: works on computers (no mobile sorry) and all browsers except: Firefox and
        Safari.<br />
        I can do Firefox easily so <a href="/contact" class="underline">lmk if interested</a>.
      </div>
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="collapse collapse-arrow bg-base-100 max-w-lg" tabindex="0">
      <div class="collapse-title text-xl font-medium text-left">Do I need to sign up?</div>
      <div class="collapse-content">No! Only to sync with other devices.</div>
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="collapse collapse-arrow bg-base-100 max-w-lg" tabindex="0">
      <div class="collapse-title text-xl font-medium text-left">How much does it cost?</div>
      <div class="collapse-content">
        Right now the beta is free. <br />As long as you sign up during beta you'll forever have the option to
        buy lifetime access for $10 on <a href="https://ko-fi.com/farosapp">kofi</a>.<br />
        <!-- I expect to charge ~$3/month later for other users. -->
      </div>
    </div>
  </div>
</div>
