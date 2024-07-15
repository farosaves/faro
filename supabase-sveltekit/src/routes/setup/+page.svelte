<script lang="ts">
  import { onMount } from "svelte"
  let err = ""
  onMount(async () => {})
</script>

<svelte:head>
  <title>Faros - Setup</title>
</svelte:head>

<div class="flex w-full justify-center">
  <button
    class="btn btn-primary"
    on:click={async () => {
      if (typeof self.showDirectoryPicker == typeof undefined) {
        err = "file access not supported"
        return
      }
      // window.dirHandle = await self.showDirectoryPicker({
      //   startIn: "pictures",
      // })
    }}>Start</button>
</div>

{err}
