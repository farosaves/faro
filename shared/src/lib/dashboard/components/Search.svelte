<script lang="ts">
  import fuzzysort from "fuzzysort"
  import { shortcut } from "shared"
  import { array as A } from "fp-ts"
  import { fzRes, fzSelectedKeys } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"
  import type { Readable } from "svelte/store"

  export let noteDeri: NoteDeri
  export let openFirst: Readable<() => void>
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
      class="input w-full max-w-xs min-w-32 border-neutral"
      use:shortcut={{ alt: true, code: "KeyF", callback }}
      bind:value={query} />
    <button hidden on:click={() => query.length && $openFirst()}></button>
  </form>
  <div class="join w-full">
    {#each entries as [ariaLabel, value] (value)}
      <input
        class="join-item btn grow btn-sm"
        type="checkbox"
        name="options"
        bind:group={selectedKeys}
        {value}
        aria-label={ariaLabel} />
    {/each}
  </div>
</div>
