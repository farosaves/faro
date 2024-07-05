<script lang="ts">
  import Tagsvify from "./Tagsvify.svelte"
  import { clickOutside } from "./click_outside"
  export let tags: string[]
  export let autoComplete: string[]
  export let onTagsChange: (tags: string[]) => void
  // export let onTagRemoved: (...args: [string, string[]]) => void
  let open = false
  let div: HTMLDivElement
</script>

<!-- @ts-ignore -->
<div tabindex="-1" class="border-primary w-full" use:clickOutside={() => (open = false)}>
  <!-- on:click_outside={() => (open = false)} -->
  <button
    class="bg-base-100 w-full min-h-6 flex justify-around tooltip-secondary"
    data-tip="Add tags here"
    class:tooltip={!tags.length}
    class:hidden={open}
    on:click={() => {
      open = true //@ts-expect-error
      setTimeout(() => div.getElementsByClassName("tagify__input").item(0)?.focus(), 100) // omg // document.
    }}>
    {#each tags as tag}
      <span class="kbd kbd-sm">{tag}</span>
    {/each}
  </button>

  <div class:hidden={!open} bind:this={div} class="text-left">
    <Tagsvify whitelist={autoComplete} bind:tags {onTagsChange} />
    <!-- <Tags bind:tags {autoComplete} {onTagAdded} {onTagRemoved} bind:id onlyUnique /> -->
  </div>
</div>
