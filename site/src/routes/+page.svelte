<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  import IconHighlighter from "~icons/jam/highlighter"
  import IconFolder from "~icons/jam/folder"
  import IconSearch from "~icons/jam/search"
  import bookmarkExport from "$lib/assets/bookmark-export.png"
  import { scrolled, SITE_URL, WEB_STORE_URL } from "$lib/utils"

  let altKey = "Alt"
  onMount(() => {
    if (navigator.userAgent.includes("Mac OS X")) altKey = "⌥"
  })

  const bookmarkFacts = [
    "No account, no sign-up, no Faro server",
    "Each save is a normal browser bookmark: the title holds the page title, the quote and your #tags",
    "Tags turn into folders inside a Faro bookmarks folder",
    "Your browser's own bookmark sync carries your saves to your other devices",
    "Text search works in the browser's URL bar too",
  ]
</script>

<svelte:head>
  <title>Faro - Saving pages done right - highlights stored as bookmarks</title>
  <meta property="og:url" content={SITE_URL} />
  <meta property="og:title" content="Faro Browser Extension" />
  <meta property="og:type" content="website" />
  <meta
    name="description"
    content="Faro is a Chrome extension that saves highlighted quotes as ordinary browser bookmarks.
    No account needed - organize with tags, stars and archive, and sync through your browser." />
</svelte:head>

<div class="min-h-screen-minus-80 flex flex-col xl:flex-row w-full pb-20 relative py-2">
  <div class="w-full xl:w-1/2 flex justify-center xl:justify-start items-start xl:items-center">
    <div class="w-full px-3 pt-10 pb-10 xl:pb-20">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full text-center xl:text-left gap-4">
          <h1 class="text-5xl font-bold">Saving pages done right</h1>
          <h2 class="text-xl lg:text-3xl font-bold text-gray-700 dark:text-gray-400">
            Ditch bookmark chaos and 100s of open tabs
          </h2>
        </div>
        <div class="divider"></div>
        <div class="w-full font-medium">
          <p class="py-1 text-center xl:text-left text-gray-800 dark:text-neutral-400">
            Faro combines web highlighting with the bookmarks you already have.
          </p>
          <p class="py-1 text-center xl:text-left text-gray-800 dark:text-neutral-400">
            Highlight a sentence and it becomes a bookmark that jumps straight back to that quote. No account, no
            server - your browser keeps and syncs everything.
          </p>
          <div class="w-full my-4 flex justify-center xl:justify-start">
            <a
              id="farogetitlink"
              class="btn btn-lg btn-primary text-xl max-w-[19rem]"
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="WebStore"
              href={WEB_STORE_URL}>
              <IconLogosChromeWebStore font-size="32" />Get it on chrome store</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="w-full xl:w-1/2 flex justify-center xl:justify-end items-start xl:items-center">
    <div class="px-3 pt-6 xl:pt-0">
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
    class="left-1/2 bottom-2 absolute hidden xl:inline transform -translate-x-1/2 -translate-y-1/2 text-center opacity-40 hover:opacity-80 transition-opacity">
    {#if $scrolled < 40}<a href="#key-features" aria-label="Scroll to features" transition:fade>
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
  <div class="p-4 text-center text-5xl font-bold">So simple</div>
  <div class="p-4 text-xl text-gray-700 dark:text-gray-400">3 features make it unique:</div>
  <div class="mt-12 w-full flex flex-col lg:flex-row items-center justify-center lg:items-start">
    <div class="w-4/5 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <IconHighlighter width="28" class="flex-shrink-0 size-6 text-black dark:text-white" />
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold">Highlight and save</h3>
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          Pick a sentence to remember the page and why you care about it. Highlight it and save it. The bookmark
          links straight to that quote, so opening it later jumps you back to the exact spot.
        </p>
      </div>
    </div>

    <div class="w-4/5 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <IconFolder width="28" class="flex-shrink-0 size-6 text-black dark:text-white" />
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-black dark:text-white">Organize <i class="italic">later</i></h3>
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          Organize your saves a day or a week later - you'll easily remember what they're about. Add <span
            class="underline tooltip"
            data-tip="Including nested tags like recipes/italian">tags</span
          >, which become bookmark folders, and star ⭐ or archive 🗄️ what matters.
        </p>
      </div>
    </div>

    <div class="w-4/5 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <IconSearch width="28" class="flex-shrink-0 size-6 text-black dark:text-white" />
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-black dark:text-white">Search all your bookmarks</h3>
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          The side panel dashboard shows every bookmark you have, not just the ones saved with Faro. Search titles
          and quotes at the same time, filter by tag, and undo or redo any change.
        </p>
      </div>
    </div>
  </div>
</div>

<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
  <div class="md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32">
    <div>
      <img
        class="rounded-xl"
        src={bookmarkExport}
        width="760"
        height="685"
        alt="A Faro save found by searching the browser's bookmarks" />
    </div>

    <div class="mt-5 sm:mt-10 lg:mt-0">
      <div class="space-y-6 sm:space-y-8">
        <div class="space-y-2 md:space-y-4">
          <h2 class="font-bold text-2xl md:text-3xl lg:text-4xl text-gray-800 dark:text-neutral-200">
            Your saves are just bookmarks
          </h2>
          <p class="text-gray-500 dark:text-neutral-400">
            Nothing is locked away. Faro works on top of your browser's bookmarks, so they stay yours.
          </p>
        </div>

        <ul class="space-y-2 sm:space-y-4">
          {#each bookmarkFacts as fact}
            <li class="flex gap-x-3">
              <span
                class="mt-0.5 size-5 shrink-0 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
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
                <span class="text-sm sm:text-base text-gray-500 dark:text-neutral-400">{fact}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="flex flex-col justify-center items-center w-full mt-20 pb-16">
  <div class="text-5xl font-bold">FAQ's</div>
  <div class="w-full lg:w-4/6">
    <div class="flex flex-col justify-center items-center my-8 w-full">
      <div class="rounded-2xl" style="width: 90%">
        <div class="collapse collapse-arrow">
          <input type="checkbox" aria-label="Why is it better than bookmarks?" />
          <div class="collapse-title text-xl font-medium text-left">Why is it better than bookmarks?</div>
          <div class="collapse-content">
            It <i class="italic">is</i> bookmarks - with the part that's missing. After you save a page it's hard
            to remember what it's about. <br />
            You <i class="italic">could</i> write notes for your bookmarks in Notion or Obsidian, but it's
            <i class="italic">too much</i> effort.<br />
            Highlights in Faro take the <i class="italic">least</i> effort - just two clicks on the text you're
            reading already, and the quote is written into the bookmark itself.<br />
            You don't need to make elaborate folders. If you want to organize later, it's easy, because you remember
            the pages, and tags are more flexible.
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" aria-label="Do I need to sign up?" />
          <div class="collapse-title text-xl font-medium text-left">Do I need to sign up?</div>
          <div class="collapse-content">
            No. There is no account and no Faro server. Your saves live in your browser's bookmarks. <br />
            To have them on your other devices, turn on bookmark sync in your browser.
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" aria-label="What happens to my existing bookmarks?" />
          <div class="collapse-title text-xl font-medium text-left">What happens to my existing bookmarks?</div>
          <div class="collapse-content">
            They all show up in the Faro dashboard, so you can search them alongside your highlights. <br />
            Faro leaves a bookmark where it is until you tag, star, archive or highlight it - only then is it moved
            into the Faro folder.
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" aria-label="How do I use it?" />
          <div class="collapse-title text-xl font-medium text-left">How do I use it?</div>
          <div class="collapse-content">
            <ul class="list-disc text-left ml-4">
              <li class="list-item">Select text</li>
              <li class="list-item">
                Press <kbd class="kbd">{altKey}</kbd> + <kbd class="kbd">X</kbd> <br />
                or right-click and select "Faro save"
              </li>
              <li class="list-item">Open the side panel to search, tag, star and archive your saves</li>
              <li class="list-item">If something doesn't work try refreshing the webpage.</li>
            </ul>
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" aria-label="Does the link always jump to the quote?" />
          <div class="collapse-title text-xl font-medium text-left">Does the link always jump to the quote?</div>
          <div class="collapse-content">
            Faro saves highlights as text-fragment links, which the browser uses to scroll to the quote. If the
            page has changed since, or loads its text dynamically, the page still opens but may not scroll to the
            quote.
          </div>
        </div>

        <div class="collapse collapse-arrow">
          <input type="checkbox" aria-label="Where is it available?" />
          <div class="collapse-title text-xl font-medium text-left">Where is it available?</div>
          <div class="collapse-content">
            It's on the <a href={WEB_STORE_URL} class="underline">Chrome Web Store</a> (desktop only for now).
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-center my-8">
    <a
      href="https://launchbuff.com/products/faro-h01y4x"
      target="_blank"
      rel="noopener noreferrer"
      title="Featured on LaunchBuff">
      <img src="https://launchbuff.com/badge-featured-dark.svg" alt="Featured on LaunchBuff" width="256" height="80" />
    </a>
  </div>
</div>

<style>
  .embed {
    width: 96vw;
    height: 54vw;
    max-width: 560px;
    max-height: 315px;
  }
</style>
