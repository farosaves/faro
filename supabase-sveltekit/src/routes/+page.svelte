<script>
  import IconRefresh from "~icons/tabler/refresh"
</script>

<svelte:head>
  <title>Faros - Save Snippets While Reading</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md space-y-3">
      <h1 class="text-5xl font-bold">Faros</h1>
      <h2 class="text-4xl font-bold">Save & organise snippets <br /> Use them like bookmarks</h2>
      <p class="py-1">
        You can go to a <u><b><a href="/dashboard/mock">mock dashboard</a></b></u> to get an idea of what it
        looks before you download the chrome extension.<br />
      </p>
      <p class="py-1">
        To use it you need to sign up and download the chrome extensions here. Or wait until I put it on the
        chrome store.<br />
      </p>
      <!-- Needless to say you shouldn't install extensions like this from people you don't know personally lol<br /> -->
      <a class="btn btn-primary" href="login">Log in or sign up</a>
      <h2 class="text-2xl font-bold">How do I use it?</h2>
      <ul class="list-disc text-nowrap w-min text-left">
        <li class="list-item">Select text</li>
        <li class="list-item">Press Alt (/ Option on Mac) + D</li>
        <li class="list-item">
          If something doesnt work try refreshing the extension <br />
          With the <IconRefresh /> icon in the top right of the sidebar.
        </li>
        <li class="list-item">You can see all cards in farosapp.com/dashboard</li>
      </ul>
    </div>
  </div>
</div>
