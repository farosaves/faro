<script>
  import { altKey, replacer } from "shared"
  // import * as CryptoJS from "crypto-js"
  // const key = CryptoJS.lib.WordArray.random(16)
  // const enc = CryptoJS.AES.encrypt("hey", key)
  // console.log(enc.ciphertext.toString())
  // console.log(CryptoJS.AES.decrypt(enc.ciphertext.toString(), key))
</script>

<svelte:head>
  <title>Faros - Save & Share Highlights - Bookmarks</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-300">
  <div class="hero flex-grow">
    <div class="hero-content text-center">
      <div class="max-w-md space-y-3">
        <h1 class="text-5xl py-4">{@html $replacer("Faros")}</h1>
        <h2 class="text-4xl font-bold">Save & share highlights <br /> Use them like bookmarks</h2>
        <p class="py-1">
          You can go to a <u><b><a href="/dashboard/mock">mock dashboard</a></b></u> to get an idea of what it
          looks before you download the chrome extension.<br />
        </p>
        <a class="btn btn-primary" href="login">Log in or sign up</a>
      </div>
    </div>
  </div>
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
