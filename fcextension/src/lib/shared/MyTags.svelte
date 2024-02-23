<script lang="ts">
  import Tags from "./Tags.svelte";
  import { clickOutside } from "./click_outside";
  export let tags: string[];
  export let autoComplete: string[];
  export let onTagAdded: (...args: [string, string[]]) => void;
  export let onTagRemoved: (...args: [string, string[]]) => void;
  let open = false;
  let tagDiv: HTMLElement;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- on:keydown={(e) => {
    e.key == "Enter" && (open = false);
    console.log(e);
  }}> -->
<!-- svelte-ignore ts(2353) -->
<div
  tabindex="-1"
  bind:this={tagDiv}
  class="border-t border-primary"
  use:clickOutside
  on:click_outside={() => (open = false)}>
  <!-- class="border-[1px] w-full min-h-2" -->
  <button
    class="bg-base-100 w-full min-h-6"
    class:hidden={open}
    on:click={() => {
      open = true;
      tagDiv.focus();
    }}>
    {#each tags as tag}
      <span>{tag}</span>
    {/each}
  </button>
  <div class:hidden={!open}>
    <Tags bind:tags {autoComplete} {onTagAdded} {onTagRemoved} />
  </div>
</div>
