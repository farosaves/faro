<script>
  import { scrolled } from "$lib/utils"
  import { altKey, API_ADDRESS, hasExtensionStore, sessStore } from "shared"
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  import IconHighlighter from "~icons/jam/highlighter"
  import IconClipboard from "~icons/jam/clipboard"
  import IconSearch from "~icons/jam/search"
  import { option as O } from "fp-ts"
  import bookmarkExport from "$lib/assets/bookmark export.png"

  export let data
  const { supabase } = data
  onMount(async () => {
    // failed to fetch if not installed
    fetch("chrome-extension://pdndbnolgapjdcebajmgcehndggfegeo/icon.svg")
      .then((r) => hasExtensionStore.set(true))
      .catch(() => undefined)
    const { data } = await supabase.auth.getSession()
    if (data) sessStore.set(O.fromNullable(data.session))
  })
</script>

<svelte:head>
  <title>Faro - Saving links done right - save with highlighted taglines</title>
  <meta property="og:url" content={API_ADDRESS} />
  <meta property="og:title" content="Faro Browser Extension" />
  <meta property="og:type" content="website" />
  <meta
    name="description"
    content="Save website links for later with Faro browser extension - a cross of bookmark manager and web highlighter.
    Organize with tags and search for easy access." />
</svelte:head>

<div class="h-screen-minus-80 flex flex-col xl:flex-row w-full pb-20 relative py-2">
  <div class="w-full xl:w-1/2 h-full flex justify-center xl:justify-start items-start xl:items-center">
    <div class="h-1/2 w-full pl-3 pt-10 pb-20">
      <div class="w-full">
        <div class="flex flex-col w-full">
          <div class="flex flex-col h-28 w-full text-center xl:text-left justify-around md:justify-between">
            <h1 class="text-5xl font-bold pb-4">Saving pages done right</h1>
            <h2 class="lg:text-3xl sm:text-xl font-bold text-gray-700 dark:text-gray-400">
              Ditch bookmark chaos and 100s of open tabs
            </h2>
            <!-- <a class="btn btn-primary" href="login">Sign up</a> -->
            <!-- For those who love learning, but have too many interests to keep track of. -->
          </div>
          <!-- <div class="divider"></div>
          yoo -->
          <div class="divider"></div>
          <div class="h-20 w-full card font-medium rounded-box">
            <!-- <p class="py-1 text-center xl:text-left text-gray-800 dark:text-neutral-400"></p> -->
            <p class="py-1 text-center xl:text-left text-gray-800 dark:text-neutral-400">
              Faro combines web highlighting with a bookmark manager
            </p>
            <p class="py-1 text-center xl:text-left text-gray-800 dark:text-neutral-400">
              So you can manage what you read and what you want to read with minimal effort
            </p>
            <p class="py-1 text-center xl:text-left text-gray-800 dark:text-neutral-400"></p>
            {#if !$hasExtensionStore}
              <div class="w-full my-2 hidden md:flex justify-center xl:justify-around">
                <a
                  id="farogetitlink"
                  class="btn btn-lg btn-primary text-xl max-w-[19rem] mx-2"
                  target="_blank"
                  data-umami-event="WebStore"
                  href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
                  <IconLogosChromeWebStore font-size="32" />Get it on chrome store</a>
                <a
                  class="btn btn-lg btn-neutral text-xl max-w-[19rem] mx-2"
                  title="Example dashboard"
                  data-umami-event="WebStore"
                  href="/dashboard/example">
                  Open demo / tutorial</a>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class=" w-full xl:w-1/2 h-full flex justify-center xl:justify-end items-start xl:items-center">
    <div class="h-1/2 px-3 pb-20">
      <iframe
        loading="lazy"
        class="embed"
        src="https://www.youtube.com/embed/ITR1xloUslE?si=NU5A-8O2ZDpBwY1N"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
    </div>
  </div>
  <div
    class=" left-1/2 bottom-2 absolute hidden xl:inline transform -translate-x-1/2 -translate-y-1/2 text-center opacity-40 hover:opacity-80 transition-opacity">
    {#if $scrolled < 40}<a href="#key-features" transition:fade>
        <svg
          class="size-16 opacity-35 m-auto cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-5 -8 24 24"
          width="28"
          fill="currentColor"
          ><path
            d="M7.071 5.314l4.95-4.95a1 1 0 1 1 1.414 1.414L7.778 7.435a1 1 0 0 1-1.414 0L.707 1.778A1 1 0 1 1 2.121.364l4.95 4.95z"
          ></path
          ></svg>
      </a>
    {/if}
  </div>
</div>
<div class="w-full pt-6 h-fit flex flex-col justify-center items-center" id="key-features">
  <div class=" p-4 text-center text-5xl font-bold">Dead simple</div>
  <div class=" p-4 text-xl text-gray-700 dark:text-gray-400">See what makes it unique:</div>
  <div class=" mt-12 w-full flex flex-col lg:flex-row items-center justify-center lg:items-start">
    <!-- Icon Blocks -->
    <!-- Icon Block -->
    <div class=" w-4/5 lg:w-1/3 m-3">
      <div
        class=" relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <IconHighlighter width="28" class="flex-shrink-0 size-6 text-black dark:text-white" />
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold">Highlight and Save</h3>
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          Pick a sentence to remember what the page is about and why you care about it. Highlight it and save
          it.
          <!-- Save your page with highlighted text snippets to remember what it is about and why you care about it. -->
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- Icon Block -->
    <div class="w-4/5 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <IconClipboard width="28" class="flex-shrink-0 size-6 text-black dark:text-white" />
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-black dark:text-white">Organize <i class="italic">later</i></h3>
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          Organize your saves a day or a week later - you'll easily remember what they're about. Do it with <span
            class="underline tooltip"
            data-tip="Including Obsidian-like nested tags">tags</span
          >, and pinning and archiving features.
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- Icon Block -->
    <div class="w-4/5 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <IconSearch width="28" class="flex-shrink-0 size-6 text-black dark:text-white" />
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-black dark:text-white">Superb text search</h3>
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          <!-- Retrieve your saved pages instantly by simply searching for the highlighted snippets, boosting you
          productivity. -->
          Search for both titles and snippets at the same time - guaranteed to give you the relevant results. No
          more googling for things you've seen.
        </p>
      </div>
    </div>
    <!-- End Icon Block -->
  </div>
</div>
<!-- End Icon Blocks -->
<!-- Features -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
  <!-- Grid -->
  <!-- <div class="collapse">
    <input type="checkbox" />
    <div class="collapse-title text-xl font-medium text-center">What about my data? If I quit?</div>
    <div class="collapse-content"> -->
  <div class="md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32">
    <div>
      <img class="rounded-xl" src={bookmarkExport} alt="Bookmark export" />
    </div>
    <!-- End Col -->

    <div class="mt-5 sm:mt-10 lg:mt-0">
      <div class="space-y-6 sm:space-y-8">
        <!-- Title -->
        <div class="space-y-2 md:space-y-4">
          <h2 class="font-bold text-2xl md:text-3xl lg:text-4xl text-gray-800 dark:text-neutral-200">
            Worried what happens to your data when you quit?
          </h2>
          <p class="text-gray-500 dark:text-neutral-400">
            You can export saves to bookmarks to keep everything.
          </p>
        </div>
        <!-- End Title -->

        <!-- List -->
        <ul class="space-y-2 sm:space-y-4">
          <li class="flex gap-x-3">
            <span
              class="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
              <svg
                class="shrink-0 size-3.5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <div class="grow">
              <span class="text-sm sm:text-base text-gray-500 dark:text-neutral-400">
                Highlights are added to bookmark titles
              </span>
            </div>
          </li>

          <li class="flex gap-x-3">
            <span
              class="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
              <svg
                class="shrink-0 size-3.5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <div class="grow">
              <span class="text-sm sm:text-base text-gray-500 dark:text-neutral-400">
                Tags turn into folders
              </span>
            </div>
          </li>

          <li class="flex gap-x-3">
            <span
              class="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
              <svg
                class="shrink-0 size-3.5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <div class="grow">
              <span class="text-sm sm:text-base text-gray-500 dark:text-neutral-400">
                Text search will work in the browser's URL bar
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
<div class="flex justify-center items-center h-min-[30rem] w-full mt-20 pb-32 relative">
  <div
    class="text-5xl font-bold mt-3 pt-3 top-0 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2">
    FAQ's
  </div>
  <div class=" w-full lg:w-4/6 h-full">
    <div class=" h-full flex flex-col justify-center items-center my-16 w-full">
      <div class="rounded-2xl" style="width: 90%">
        <div class="collapse collapse-arrow">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-left">Why is it better than bookmarks?</div>
          <div class="collapse-content">
            With bookmarks after you save a page it's hard to remember what it's about. <br />
            You <i class="italic">could</i> make custom notes for your bookmarks and put them in Notion or
            Obisidian, but it's <i class="italic">too much</i> effort.<br />
            Taglines in Faro require the <i class="italic">least</i> effort - just two clicks to higlight the
            text you're reading already.<br />
            You don't need to make elaborate folders etc.. If you want to organize them later, it's easy, because
            you remember the pages, and tags are more flexible.
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-left">Where is it available?</div>
          <div class="collapse-content">
            It's on <a
              href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo"
              class="underline">chrome webstore</a>
            (desktop only for now).<br />
            Can do Firefox easily so <a href="/contact" class="underline">let us know if interested</a>.
          </div>
        </div>
        <div class="collapse collapse-arrow">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-left">Do I need to sign up?</div>
          <div class="collapse-content">
            No! It works locally without signing up. <br />Sign up is only required to use the webapp and sync
            across devices.
          </div>
        </div>
        <div class="collapse collapse-arrow">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-left">How do I use it?</div>
          <div class="collapse-content">
            <ul class="list-disc text-left ml-4">
              <li class="list-item">Select text</li>
              <li class="list-item">
                Press <kbd class="kbd">{altKey}</kbd> + <kbd class="kbd">X</kbd> <br />
                or right-click and select "Faro save"
              </li>
              <li class="list-item">If something doesn't work try refreshing the webpage.</li>
            </ul>
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-left">Pricing</div>
          <div class="collapse-content">
            The first 1000 saves are free.<br /> I'm planning to do $10 for life for unlimited saves. It's not
            implemented yet, so right now there is no limit.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .embed {
    top: 0;
    left: 0;
    width: 96vw;
    height: 54vw;
    max-width: 560px;
    max-height: 315px;
  }
</style>
