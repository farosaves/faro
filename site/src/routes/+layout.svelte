<script lang="ts">
  import "../styles.css"
  import Navbar from "$lib/components/Navbar.svelte"
  import { scrolled, SITE_URL } from "$lib/utils"
</script>

<svelte:head>
  <meta property="og:image" content="{SITE_URL}/tile.png" />
  <script
    defer
    src="https://analytics.us.umami.is/script.js"
    data-website-id="d6ea5b3a-1a06-4012-8968-336951400cb0"></script>
</svelte:head>

<div
  on:scroll={(e) => ($scrolled = e.currentTarget.scrollTop)}
  class="scroll-container absolute -z-10 h-full overflow-y-auto w-full flex flex-col items-center [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
  <div class="w-full max-w-screen-xl">
    <Navbar />
    <slot />

    <footer class="rounded-lg m-4">
      <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div class="sm:flex sm:items-center sm:justify-between">
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
            ><a class="btn-ghost text-xl mont" href="/">Faro</a></span>
          <ul
            class="flex flex-wrap items-center mb-3 text-sm font-medium text-gray-800 sm:mb-0 dark:text-gray-400">
            <li>
              <a href="/legal/tos" class="hover:underline me-4 md:me-6">Terms of Service</a>
            </li>
            <li>
              <a href="/legal/privacy" class="hover:underline">Privacy Policy</a>
            </li>
          </ul>
        </div>
        <div class="divider"></div>
        <span class="block text-sm text-gray-800 sm:text-center dark:text-gray-400"
          >© 2024 - Pawel Paradysz, All Rights Reserved. Created using <a
            href="https://jam-icons.com/"
            class="hover:underline">Jam Icons</a
          ></span>
      </div>
    </footer>
  </div>
</div>

<style>
  .scroll-container {
    scroll-behavior: smooth;
  }
</style>
