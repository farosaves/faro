<script lang="ts">
  import IconDiscord from "~icons/logos/discord-icon"
  import IconCog from "~icons/jam/cog"

  import { replacer, themeStore, updateTheme } from "shared"
  const themes = ["default", "light", "dark", "retro", "cyberpunk", "aqua"]
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { themeChange } from "theme-change"
  onMount(() => {
    // @ts-expect-error
    window.lololo = () => get(themeStore)
    themeChange(false)
  })
  const iconSize = 15
</script>

<div class="navbar z-30 relative bg-base-100">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl mont" href="/">{@html $replacer("Faros")}</a>
  </div>
  <div class="navbar-center">
    <ul class="menu menu-horizontal px-1 text-lg">
      <li><a href="/dashboard" data-umami-event="Nav DB">Dashboard</a></li>
      <!-- <li><a href="/notes/pinned">Pinned</a></li>
      <li><a href="/notes/queue">Queue</a></li> -->
      <!-- <li><a href="upload">Upload</a></li> -->
      <li><a href="/account" data-umami-event="Nav Acc">Account</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <a
      class="btn btn-ghost p-2 tooltip tooltip-left"
      href="https://discord.gg/6TvDFPA6bs"
      data-tip="Join the server;]"><IconDiscord font-size={24} /></a>
    <a class="btn btn-ghost" href="/contact">Contact</a>
    <!-- <ul class="menu lg:menu-horizontal bg-base-200 rounded-box mr-2">
      <li>
        <details>
          <summary>Settings</summary>
          <ul>
            {#if option.isSome($sessStore)}<li><a>Submenu 1</a></li>{/if}
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
        </details>
      </li>
    </ul> -->

    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn m-1">Theme</div>
      <div class="dropdown-content join join-vertical">
        {#each themes as value}
          <button
            class="btn join-item"
            data-set-theme={value}
            data-act-class="ACTIVECLASS"
            on:click={() => setTimeout(updateTheme, 100)}
            >{value.replace(/\b\w/g, (s) => s.toUpperCase())}</button>
        {/each}
      </div>
    </div>
  </div>
</div>
