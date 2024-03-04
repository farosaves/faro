<script lang="ts">
  import { updateTheme } from "shared";
  const themes = ["light", "dark", "retro", "cyberpunk", "aqua", "night"];
  import { onMount } from "svelte";
  import { themeChange } from "theme-change";

  onMount(() => {
    themeChange(false);
  });
</script>

<div class="navbar z-10 relative">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl" href="/">Faros</a>
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

          <!-- <input
            type="radio"
            name="theme-buttons"
            class="btn join-item"
            bind:group={selectedTheme}
            aria-label={value.replace(/\b\w/g, (s) => s.toUpperCase())}
            {value} /> -->
        {/each}
      </div>
    </div>

    <!-- <div class="dropdown mb-72">
      <div tabindex="0" role="button" class="btn m-1">
        Theme
        <svg width="12px" height="12px" class="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
      </div>
      <ul tabindex="0" class="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52">
        {#each themes as value}
        <li><input type="radio" name="theme-dropdown" class="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label="{value.toUpperCase()}" {value}/></li>
        {/each}
      </ul>
    </div> -->
  </div>
</div>
