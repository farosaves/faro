<script lang="ts">
  import IconDiscord from "~icons/logos/discord-icon"
  import IconMenu from "~icons/jam/menu"
  import IconUser from "~icons/jam/user-circle"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  import IconEnvelope from "~icons/jam/envelope"

  import { sessStore, updateTheme } from "shared"
  const themes = ["default", "light", "dark", "retro", "cyberpunk", "aqua"]
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { themeChange } from "theme-change"
  import { option as O } from "fp-ts"
  // let contentRect: DOMRectReadOnly
  let navDiv: HTMLDivElement
  export let scrollParent: (x: number) => void
  onMount(() => {
    themeChange(false)
    updateTheme()
    if (/\/dashboard/.test(location.href)) scrollParent(navDiv.getBoundingClientRect().bottom)
  })
</script>

<div class="navbar z-30 h-20 relative" bind:this={navDiv}>
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl mont dark:text-yellow-100" title="Main page" href="/"><b>Faro</b></a>
  </div>
  <div class="navbar-center">
    <ul class="menu menu-horizontal px-1 text-xl font-semibold">
      <li>
        <a
          href="/dashboard"
          title="Go to your dashboard"
          on:click={() => scrollParent(navDiv.getBoundingClientRect().bottom)}
          data-umami-event="Nav DB">Dashboard</a>
      </li>
      <!-- <li><a href="/notes/pinned">Pinned</a></li>
      <li><a href="/notes/queue">Queue</a></li> -->
      <!-- <li><a href="upload">Upload</a></li> -->
    </ul>
  </div>
  <div class="navbar-end">
    <a
      class="btn btn-ghost p-2 inline-flex"
      data-umami-event="WebStore"
      title="Webstore"
      href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
      <IconLogosChromeWebStore font-size="24" /></a>
    <!-- <a
      class="btn btn-ghost p-2"
      target="_blank"
      href="https://discord.gg/6TvDFPA6bs"
      title="Join Discord server"><IconDiscord font-size={24} /></a> -->

    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="m-1"><IconMenu font-size="32" /></div>
      <ul class="menu dropdown-content bg-base-200 rounded-box mr-2 text-lg">
        <!-- <li><a href="/account" data-umami-event="Nav Acc">Account<IconUser font-size="16" /></a></li> -->
        <li>
          {#if O.isSome($sessStore)}
            <!-- <a href="/account" data-umami-event="Nav Acc"></a> -->
            <details class="text-center">
              <summary>Account<IconUser font-size="16" /></summary>
              <div class="text-sm">
                <span>
                  Logged in as:
                  {$sessStore.value.user.email?.split("@").at(0)}
                </span>
                <a href="/account/sign-out" class="btn btn-sm text-error w-full" data-umami-event="Nav Logout"
                  >Logout</a>
              </div>
            </details>
          {:else}
            <a href="/account/login" data-umami-event="Nav Login">Login</a>
          {/if}
        </li>
        <li><a class="" href="/contact">Contact<IconEnvelope font-size="16" /></a></li>
        <li>
          <!-- {#if option.isSome($sessStore)}<li><a>Submenu 1</a></li>{/if} -->
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
