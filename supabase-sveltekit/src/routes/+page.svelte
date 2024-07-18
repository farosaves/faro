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
  <title>Faro - Save online reading - bookmark highlights</title>
  <meta
    name="description"
    content="Save web pages for later with Faros browser extension. Highlight, save & organize. " />
</svelte:head>

<div class=" h-screen-minus-80 flex flex-col xl:flex-row w-full pb-20">
  <div class=" w-full xl:w-1/2 h-full flex justify-center xl:justify-start items-start xl:items-center">
    <div class="h-1/2 w-full md:w-1/2 xl:w-full pl-3 pt-10 pb-20">
      <div class="w-full">
        <div class="flex flex-col w-full">
          <div class="flex flex-col h-28 w-full justify-around md:justify-between">
            <h2 class="xl:text-6xl text-5xl text-center lg:text-left font-bold pb-4">Save online reading</h2>
            <h3 class="lg:text-3xl sm:text-xl text-center lg:text-left font-bold">
              Never forget what you saved and why
            </h3>
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
          <div class="h-20 w-full card rounded-box">
            <p class="py-1 text-center xl:text-left">
              Do you love learning, but have too many interests to keep track of?
            </p>
            <p class="py-1 text-center xl:text-left">Now you can manage it - doing (almost) nothing extra.</p>
            <p class="py-1 text-center xl:text-left">Watch the video to learn how:</p>
            <!-- You can check out the <u><b><a href="/dashboard/mock">mock dashboard</a></b></u>
              to see what it looks like
              <br />
              Or  -->
            <!-- Watch the video introduction: -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class=" w-full xl:w-1/2 h-full flex justify-center xl:justify-end items-start xl:items-center">
    <div class="h-1/2 px-3 pb-20">
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
  </div>
</div>
<div class="w-full mt-4 h-fit flex flex-col justify-center items-center">
  <div class=" p-4 text-center text-5xl">Key Features</div>
  <div class=" p-4 text-xl">Explore how Faro transforms your reading experience:</div>
  <div class=" mt-12 w-full flex justify-center items-start border-2">
    <!-- Icon Blocks -->
    <!-- Icon Block -->
    <div class="w-1/3 m-3">
      <div
        class=" relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <svg
          class="flex-shrink-0 size-6 text-blue-600 dark:text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><rect width="10" height="14" x="3" y="8" rx="2" /><path
            d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" /><path d="M8 18h.01" /></svg>
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold">Highlight and Save</h3>
        <p class="mt-1">
          Save your online readings with highlighted text snippets for quick and easy access later on.
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- Icon Block -->
    <div class="w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <svg
          class="flex-shrink-0 size-6 text-blue-600 dark:text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle
            cx="7"
            cy="7"
            r="3" /></svg>
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Organize Seemlessly</h3>
        <p class="mt-1 text-gray-600 dark:text-neutral-400">
          Effortlessly organize your saved pages with tagged highlights, eliminating cluttered chaos found in
          traditional bookmarks
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- Icon Block -->
    <div class="w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <svg
          class="flex-shrink-0 size-6 text-blue-600 dark:text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path
            d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Efficient Retrieval</h3>
        <p class="mt-1 text-gray-600 dark:text-neutral-400">
          Retrieve your saved pages instantly by simply searching for the highlighted snippets, boosting you
          productivity.
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- End Icon Block -->
  </div>
</div>
<!-- End Icon Blocks -->
<div class="flex flex-col xl:flex-row h-screen-minus-80 w-full pb-32">
  <div class="xl:w-1/2 w-full h-full">
    <div class=" h-full flex flex-col justify-center items-center xl:items-start my-16 w-full">
      <div class="max-w-lg rounded-2xl">
        <!-- <div class="collapse collapse-arrow">
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium text-left">Why would I need it?</div>
      <div class="collapse-content">
        <span class="my-2 block"
          >Imagine you're browsing and you come across something you want to be able to go back to later...</span>
        <span class="my-2 block"
          >If you bookmark it you'll likely forget why you did it in a few weeks.</span>
        <span class="my-2 block">With Faros remembering & revisiting is as easy as possible.</span>
      </div>
    </div> -->
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
  <div class="xl:w-1/2 w-full h-full">
    <div class=" h-full flex flex-col justify-center items-center my-16 w-full">
      <div class="w-full">
        <h3 class="text-2xl p-3 xl:text-right text-center font-bold">TL;DW</h3>
        <p class="p-3 xl:text-right text-center font-bold">Bookmarks ✕ Web Clipper</p>
        <p class="p-3 xl:text-right text-center">You highlight a snippet to remember the page better.</p>
        <p class="p-3 xl:text-right text-center">
          Your saves show both the page title and the snippet you picked.
        </p>
      </div>
    </div>
  </div>
</div>
