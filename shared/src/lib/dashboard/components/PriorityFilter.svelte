<script lang="ts">
  import IconStar from "~icons/tabler/star"
  import IconStarOff from "~icons/tabler/star-off"
  import IconArchive from "~icons/tabler/archive"
  import IconArchiveOff from "~icons/tabler/archive-off"
  import type { NoteDeri } from "$lib"

  import { array as A, number as N } from "fp-ts"
  import { pipe } from "fp-ts/lib/function"
  import { selectedPriorities } from "../filterSortStores"
  export let noteArr: NoteDeri["noteArr"]
  const toggleValCb = (val: "star" | "none" | "archive") => () =>
    selectedPriorities.update((s) => {
      s.delete(val) || s.add(val)
      return s
    })

  // bind:group={selectedKeys}
</script>

{#if pipe( $noteArr, A.map((x) => x.prioritised), A.uniq(N.Eq), A.size, ) > 1}
  <div class="flex flex-col content-center">
    <!-- possibly these should be swaps like in stararchive -->
    <div class="join w-full">
      <button
        class="join-item btn grow btn-sm"
        style="display: inline-flex"
        data-tip="hey;)"
        name="options"
        on:click={toggleValCb("star")}
        class:btn-secondary={$selectedPriorities.has("star")}>
        <IconStar />
      </button>
      <button
        class="join-item btn grow btn-sm"
        style="display: inline-flex"
        data-tip="hey;)"
        name="options"
        on:click={toggleValCb("none")}
        class:btn-secondary={$selectedPriorities.has("none")}>
        <IconStarOff />
        <IconArchiveOff />
      </button>
      <button
        class="join-item btn grow btn-sm"
        style="display: inline-flex"
        data-tip="hey;)"
        name="options"
        on:click={toggleValCb("archive")}
        class:btn-secondary={$selectedPriorities.has("archive")}>
        <IconArchive />
      </button>
    </div>
  </div>
{/if}
