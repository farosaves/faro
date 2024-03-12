<script lang="ts">
  import Tags from "./Tags.svelte"
  import { clickOutside } from "./click_outside"
  export let tags: string[]
  export let autoComplete: string[]
  export let onTagAdded: (...args: [string, string[]]) => void
  export let onTagRemoved: (...args: [string, string[]]) => void
  let open = false
  let id: string
</script>

<div tabindex="-1" class="border-t border-primary" use:clickOutside on:click_outside={() => (open = false)}>
  <button
    class="bg-base-100 w-full min-h-6 flex justify-around"
    data-tip="Add tags here"
    class:tooltip={!tags.length}
    class:hidden={open}
    on:click={() => {
      open = true
      setTimeout(() => document.getElementById(id)?.focus(), 100) // omg
    }}>
    {#each tags as tag}
      <span class="">{tag}</span>
    {/each}
  </button>
  <div class:hidden={!open}>
    <Tags bind:tags {autoComplete} {onTagAdded} {onTagRemoved} bind:id onlyUnique />
  </div>
</div>
