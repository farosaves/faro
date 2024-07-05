<script lang="ts">
  import Tags from "./Tags.svelte"
  import Tagsvify from "./Tagsvify.svelte"
  import { clickOutside } from "./click_outside"
  export let tags: string[]
  export let autoComplete: string[]
  export let onTagAdded: (...args: [string, string[]]) => void
  export let onTagRemoved: (...args: [string, string[]]) => void
  let open = false
  let div: HTMLDivElement
</script>

<!-- @ts-ignore -->
<div tabindex="-1" class="border-t border-primary w-full" use:clickOutside={() => (open = false)}>
  <!-- on:click_outside={() => (open = false)} -->
  <button
    class="bg-base-100 w-full min-h-6 flex justify-around tooltip-secondary"
    data-tip="Add tags here"
    class:tooltip={!tags.length}
    class:hidden={open}
    on:click={() => {
      open = true
      setTimeout(() => div.getElementsByClassName("tagify__input").item(0)?.focus(), 100) // omg // document.
    }}>
    {#each tags as tag}
      <span class="">{tag}</span>
    {/each}
  </button>

  <div class:hidden={!open} bind:this={div}>
    <Tagsvify whitelist={autoComplete} />
    <!-- <Tags bind:tags {autoComplete} {onTagAdded} {onTagRemoved} bind:id onlyUnique /> -->
  </div>
</div>
