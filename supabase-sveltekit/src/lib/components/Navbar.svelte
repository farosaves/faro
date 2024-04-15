<script lang="ts">
  import { replacer, updateTheme } from "shared"
  const themes = ["default", "light", "dark", "retro", "cyberpunk", "aqua", "night"]
  import { onMount } from "svelte"
  import { themeChange } from "theme-change"
  onMount(() => {
    themeChange(false)
  })
</script>

<div class="navbar z-30 relative">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl" href="/">{@html $replacer("Faros")}</a>
  </div>
  <div class="navbar-center">
    <ul class="menu menu-horizontal px-1 text-lg">
      <li><a href="/dashboard">Dashboard</a></li>
      <!-- <li><a href="/notes/pinned">Pinned</a></li>
      <li><a href="/notes/queue">Queue</a></li> -->
      <!-- <li><a href="upload">Upload</a></li> -->
      <li><a href="/account">Account</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <a class="btn btn-ghost" href="mailto:pawel@farosapp.com">Contact</a>
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
