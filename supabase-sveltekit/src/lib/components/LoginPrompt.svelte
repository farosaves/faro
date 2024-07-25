<script lang="ts">
  import { hasExtensionStore } from "shared"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  export let showLoginPrompt: boolean
</script>

<div class="flex flex-col md:flex-row">
  {#if showLoginPrompt}
    <div role="alert" class="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>Not logged in! <a class="underline" href="/account/login">Click here</a></span>
    </div>
  {/if}
  {#if !$hasExtensionStore}
    <a
      id="farogetitlink"
      class="btn btn-primary text-xl flex-grow"
      target="_blank"
      data-umami-event="WebStore"
      href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
      <IconLogosChromeWebStore font-size="32" />Install the extension</a>
  {/if}
</div>

<style>
  .alert {
    grid-auto-flow: column;
    grid-template-columns: auto minmax(auto, 1fr);
  }
</style>
