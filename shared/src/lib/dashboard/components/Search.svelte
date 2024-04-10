<script lang="ts">
  import fuzzysort from "fuzzysort"
  import { shortcut } from "shared"
  import { array as A } from "fp-ts"
  import { fzRes, fzSelectedKeys } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"

  export let noteDeri: NoteDeri
  const notes = noteDeri.noteArr
  let query = ""
  const possibleSelections = ["sources.title", "quote"]
  const texts = ["Titles", "Text"]
  const entries = A.zip(possibleSelections)(texts)
  let selectedKeys = possibleSelections // : (typeof possibleSelections)[number][]
  $: fzRes.set(!!query && fuzzysort.go(query, $notes, { keys: selectedKeys, limit: 15 }))
  $: fzSelectedKeys.set(selectedKeys)
  $: query
  const callback = () => document.getElementById("search_input")?.focus()
</script>

<div class="flex flex-col content-center">
  <form>
    <!-- svelte-ignore a11y-autofocus -->
    <input
      type="text"
      id="search_input"
      autofocus
      placeholder="Type here to search"
      class="input w-full max-w-xs min-w-32"
      use:shortcut={{ alt: true, code: "KeyF", callback }}
      bind:value={query} />
    <button hidden on:click={() => console.log(query, $fzRes, selectedKeys, $notes.length)}></button>
  </form>
  <div class="join w-full">
    {#each entries as [ariaLabel, value] (value)}
      <input
        class="join-item btn grow"
        type="checkbox"
        name="options"
        bind:group={selectedKeys}
        {value}
        aria-label={ariaLabel} />
    {/each}
  </div>
</div>
