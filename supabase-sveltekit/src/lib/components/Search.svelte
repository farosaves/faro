<script lang="ts">
  import fuzzysort from "fuzzysort"
  import { shortcut, type NoteEx, type NoteSync } from "shared"
  import { array as A, option as O, readonlyArray as RA } from "fp-ts"
  import { identity, pipe } from "fp-ts/lib/function"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { fzRes, fzSelectedKeys } from "$lib/filterSortStores"

  export let note_sync: NoteSync
  const notes = note_sync.noteArr
  let query = ""
  const possibleSelections = ["sources.title", "quote"]
  const texts = ["Titles", "Text"]
  const entries = A.zip(possibleSelections)(texts)
  let selectedKeys = possibleSelections // : (typeof possibleSelections)[number][]
  $: fzRes.set(!!query && fuzzysort.go(query, $notes, { keys: selectedKeys, limit: 25 }))
  $: fzSelectedKeys.set(selectedKeys)
  $: query
  // $: console.log(selectedKey)
  const callback = () => document.getElementById("search_input")?.focus()
  onMount(() => {
    if ($page.url.searchParams.has("search")) setTimeout(callback, 200)
  })
</script>

<div class="flex flex-col content-center">
  <form>
    <input
      type="text"
      id="search_input"
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
