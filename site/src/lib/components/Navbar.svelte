<script lang="ts">
  import IconMenu from "~icons/jam/menu"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  import { onMount } from "svelte"
  import { themeChange } from "theme-change"
  import { updateTheme, WEB_STORE_URL } from "$lib/utils"

  const themes = ["default", "light", "dark", "retro", "cyberpunk", "aqua"]
  onMount(() => {
    themeChange(false)
    updateTheme()
  })
</script>

<div class="navbar z-30 h-20 relative">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl mont dark:text-yellow-100" title="Main page" href="/"><b>Faro</b></a>
  </div>
  <div class="navbar-end">
    <a class="btn btn-ghost p-2 inline-flex" data-umami-event="WebStore" title="Webstore" href={WEB_STORE_URL}>
      <IconLogosChromeWebStore font-size="24" /></a>
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="m-1" aria-label="Menu"><IconMenu font-size="32" /></div>
      <ul class="menu dropdown-content bg-base-200 rounded-box mr-2 text-lg">
        <li>
          <details class="join">
            <summary>Theme</summary>
            {#each themes as value}
              <li>
                <button
                  class="btn join-item"
                  data-set-theme={value}
                  data-act-class="ACTIVECLASS"
                  on:click={() => setTimeout(updateTheme, 100)}
                  >{value.replace(/\b\w/g, (s) => s.toUpperCase())}</button>
              </li>
            {/each}
          </details>
        </li>
      </ul>
    </div>
  </div>
</div>
