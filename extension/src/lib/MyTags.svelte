<script lang="ts">
  import Tagsvify from "./Tagsvify.svelte"
  import { clickOutside } from "./click_outside"
  import IconFolder from "~icons/tabler/folder"
  export let tags: string[]
  /** Read-only folder tags of a plain bookmark (decision 5.1c): shown, filterable, not editable. */
  export let derivedTags: string[] = []
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
    data-testid="note-tags"
    on:click={() => {
      open = true //@ts-expect-error
      setTimeout(() => div.getElementsByClassName("tagify__input").item(0)?.focus(), 100)
    }}>
    {#each derivedTags as tag}
      <span
        class="kbd kbd-sm mt-1 border-dashed opacity-70 italic font-normal inline-flex items-center gap-1"
        data-derived-tag={tag}
        title="Folder of this bookmark (read-only). Adding a tag moves the bookmark into the Faro folder and keeps this as a tag."
        ><IconFolder font-size="0.7rem" />{tag}</span>
    {/each}
    {#each tags as tag}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="kbd kbd-sm mt-1 hover:bg-base-300"
        data-tag={tag}
        on:contextmenu|preventDefault={() => window.postMessage({ action: "editTag", tag }, "*")}>{tag}</span>
    {/each}
  </button>

  <!-- tagify performance much worse-->
  {#if open}
    <div bind:this={div} class="text-left">
      <Tagsvify whitelist={autoComplete} bind:tags {onTagsChange} />
      <!-- <Tags bind:tags {autoComplete} {onTagAdded} {onTagRemoved} bind:id onlyUnique /> -->
    </div>
  {/if}
</div>
