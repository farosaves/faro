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

<div class=" h-screen-minus-80 flex flex-col xl:flex-row w-full pb-20 relative">
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
            {#if !$hasExtensionStore}
              <div class="w-full my-2">
                <a
                  id="farosgetitlink"
                  class="btn btn-lg btn-primary text-xl max-w-[19rem] m-auto"
                  target="_blank"
                  data-umami-event="WebStore"
                  href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
                  <IconLogosChromeWebStore font-size="32" />Get it on chrome store</a>
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
  <div
    class=" left-1/2 bottom-2 absolute hidden xl:inline transform -translate-x-1/2 -translate-y-1/2 text-center">
    <a href="#key-features">
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
  </div>
</div>
<div class="w-full pt-6 h-fit flex flex-col justify-center items-center" id="key-features">
  <div class=" p-4 text-center text-5xl font-bold">Key Features</div>
  <div class=" p-4 text-xl text-gray-400">Explore how Faro transforms your reading experience:</div>
  <div class=" mt-12 w-full flex flex-col lg:flex-row items-center justify-center lg:items-start">
    <!-- Icon Blocks -->
    <!-- Icon Block -->
    <div class=" w-1/2 lg:w-1/3 m-3">
      <div
        class=" relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <svg
          class="flex-shrink-0 size-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-0.5 -1 24 24"
          width="28"
          fill="currentColor"
          ><path
            d="M8.038 11.06l-1.035 3.207 1.776 1.775 3.165-1.077-3.906-3.906zm1.24-1.59l4.242 4.243 6.364-6.364a2 2 0 0 0 0-2.829L18.47 3.106a2 2 0 0 0-2.829 0L9.277 9.47zm-3.503 6.4L3.88 17.765l1.653 1.151 1.644-1.644-1.402-1.402zM19.884 1.692l1.414 1.414a4 4 0 0 1 0 5.657l-7.778 7.778-4.22 1.437-3.536 3.535L.778 18.04l4.291-4.292L6.45 9.47l7.778-7.778a4 4 0 0 1 5.657 0z"
          ></path
          ></svg>
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold">Highlight and Save</h3>
        <p class="mt-1 text-gray-600 dark:text-neutral-400">
          Save your online readings with highlighted text snippets for quick and easy access later on.
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- Icon Block -->
    <div class="w-1/2 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <svg
          class="flex-shrink-0 size-7 text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-5 -6 24 24"
          width="28"
          fill="currentColor"
          ><path
            d="M4 1h9a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 8h9a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0-4h9a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zM.438.845h.72L1.111 3H.65L.7 1.28H.224L.438.845zM.523 5.59l-.45-.053c.011-.244.09-.439.234-.582a.76.76 0 0 1 .556-.214c.139 0 .263.03.37.089a.67.67 0 0 1 .26.258.677.677 0 0 1 .097.342.988.988 0 0 1-.115.435c-.075.153-.211.33-.407.535l-.158.17h.647V7H.014l.015-.231.666-.68c.158-.16.263-.288.313-.382a.531.531 0 0 0 .074-.245.227.227 0 0 0-.067-.17.242.242 0 0 0-.179-.067.233.233 0 0 0-.182.081c-.034.038-.077.132-.131.284zm.982 4.398c.08.106.121.23.121.373a.7.7 0 0 1-.23.528.813.813 0 0 1-.579.215.758.758 0 0 1-.545-.203c-.142-.136-.22-.32-.183-.603l.456.042c.015.101.05.174.1.22.05.045.115.068.194.068.083 0 .15-.026.203-.078a.253.253 0 0 0 .08-.19.256.256 0 0 0-.109-.209c-.075-.06-.187-.09-.386-.143l.046-.401a.622.622 0 0 0 .203-.042.223.223 0 0 0 .092-.077.175.175 0 0 0 .032-.1.142.142 0 0 0-.045-.109.176.176 0 0 0-.127-.044.211.211 0 0 0-.13.044.217.217 0 0 0-.08.113l-.048.035-.444-.056a.703.703 0 0 1 .185-.413.71.71 0 0 1 .53-.217c.189 0 .35.06.479.182a.58.58 0 0 1 .195.436.516.516 0 0 1-.087.29c-.056.085-.136.153-.246.12a.626.626 0 0 1 .323.219z"
          ></path
          ></svg>
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-white">Organize Seemlessly</h3>
        <p class="mt-1 text-gray-600 dark:text-neutral-400">
          Effortlessly organize your saved pages with tagged highlights, eliminating cluttered chaos found in
          traditional bookmarks
        </p>
      </div>
    </div>
    <!-- End Icon Block -->

    <!-- Icon Block -->
    <div class="w-1/2 lg:w-1/3 m-3">
      <div
        class="relative flex justify-center items-center size-12 rounded-xl before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded-xl dark:bg-neutral-900">
        <svg
          class="flex-shrink-0 size-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-5 -2 24 24"
          width="28"
          fill="currentColor"
          ><path
            d="M3 2a1 1 0 0 0-1 1v15l2.978-2.717a3 3 0 0 1 4.044 0L12 18V3a1 1 0 0 0-1-1H3zm0-2h8a3 3 0 0 1 3 3v15a2 2 0 0 1-3.348 1.477L7.674 16.76a1 1 0 0 0-1.348 0l-2.978 2.717A2 2 0 0 1 0 18V3a3 3 0 0 1 3-3z"
          ></path
          ></svg>
      </div>
      <div class="mt-5">
        <h3 class="text-lg font-semibold text-white">Efficient Retrieval</h3>
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
<div class="flex justify-center items-center h-[25rem] w-full mt-20 pb-32 relative">
  <div
    class="text-5xl font-bold mt-3 pt-3 top-0 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2">
    FAQ's
  </div>
  <div class=" w-full lg:w-4/6 h-full">
    <div class=" h-full flex flex-col justify-center items-center my-16 w-full">
      <div class="w-full rounded-2xl">
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
          <div class="collapse-content">
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
  <!--
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
  -->
</div>
