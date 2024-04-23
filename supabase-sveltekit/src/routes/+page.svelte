<script>
  import { altKey, replacer } from "shared"
  import IconEnvelope from "~icons/jam/envelope"
  // import * as CryptoJS from "crypto-js"
  // const key = CryptoJS.lib.WordArray.random(16)
  // const enc = CryptoJS.AES.encrypt("hey", key)
  // console.log(enc.ciphertext.toString())
  // console.log(CryptoJS.AES.decrypt(enc.ciphertext.toString(), key))
  export let form
</script>

<svelte:head>
  <title>Faros - Save & Share Highlights - Bookmarks</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-300">
  <div class="hero flex-grow">
    <div class="hero-content text-center">
      <div class="flex flex-col w-full place-items-center">
        <div class="max-w-md space-y-4">
          <h1 class="text-5xl py-4">{@html $replacer("Faros")}</h1>
          <h2 class="text-4xl font-bold">Save & share highlights <br /> Use them like bookmarks</h2>
          <!-- <a class="btn btn-primary" href="login">Sign up</a> -->
          <br />
          {#if form?.success}<div class="collapse collapse-close bg-base-100">
              <div class="collapse-title text-xl font-medium text-center p-4">All set, thx!</div>
            </div>
          {:else}
            <div class="collapse bg-base-100">
              <input type="checkbox" />
              <div class="collapse-title text-xl font-medium text-center p-4">Get emailed when goes live</div>
              <div class="collapse-content mx-4">
                <form method="POST">
                  <label class="input input-bordered flex items-center gap-2">
                    <IconEnvelope />
                    <input name="email" type="email" class="grow" placeholder="Email" />
                    <button hidden type="submit"></button>
                  </label>
                </form>
              </div>
            </div>
          {/if}
        </div>

        <div class="divider"></div>
        <div class="grid h-20 card bg-base-300 rounded-box place-items-center">
          <p class="py-1">
            Check out <u><b><a href="/dashboard/mock">mock dashboard</a></b></u> to see what it looks like
            <br />
            Or watch the video introduction:
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
    <div class="collapse collapse-arrow bg-base-100 w-1/2">
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium text-left">How do I use it?</div>
      <div class="collapse-content mx-4">
        <ul class="list-disc text-nowrap w-min text-left">
          <li class="list-item">Select text</li>
          <li class="list-item">Press {altKey} + D</li>
          <li class="list-item">
            If something doesnt work try refreshing the extension <br />
            With the 🔄 icon in the top right of the sidebar.
          </li>
        </ul>
      </div>
    </div>
    <div class="collapse collapse-arrow bg-base-100 w-1/2">
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium text-left">Do I need to sign up?</div>
      <div class="collapse-content">No! <br />But in order to sync you do.</div>
    </div>
    <div class="collapse collapse-arrow bg-base-100 w-1/2">
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium text-left">Why name Faros?</div>
      <div class="collapse-content">
        From <a class="underline" href="https://en.wikipedia.org/wiki/Lighthouse_of_Alexandria"
          >the lighthouse</a
        >. <br />
        It's from the times of Library of Alexandria, which was the largest at the time.<br />
        Now the largest "library" is the internet.<br />
        The extension helps you navigate.
      </div>
    </div>
  </div>
</div>
