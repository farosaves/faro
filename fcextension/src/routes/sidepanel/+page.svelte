<script>
  export let data;
  import Snippet from "$lib/Snippet.svelte";
</script>

<div class="max-w-xs mx-auto">
  <Snippet {data} />
  <span
    class="block p-4 my-2 bg-green-500 text-white hover:bg-green-600 rounded-md"
    >Clickable Text 2</span
  >
  <span
    class="block p-4 my-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-md"
    >Clickable Text 3</span
  >
  <div class="h-8"></div>
</div>
