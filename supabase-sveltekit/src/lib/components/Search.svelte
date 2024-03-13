<script lang="ts">
  import fuzzysort from "fuzzysort"
  import type { NoteEx, NoteSync, Notes } from "shared"
  import { array as A, option as O } from "fp-ts"
  import { identity, pipe } from "fp-ts/lib/function"

  export let note_sync: NoteSync
  const notes = note_sync.noteArr
  let query = ""
  const possibleSelections = ["sources.title", "quote"]
  const texts = ["Titles", "Text"]
  const entries = A.zip(possibleSelections)(texts)
  let selectedKey = possibleSelections // : (typeof possibleSelections)[number][]
  $: res = !!query && fuzzysort.go(query, $notes, { keys: selectedKey, limit: 5 })
  //   let allHighlight = (result: any) => fuzzysort.highlight(res[0]);
  // $: res && res.length && console.log(fuzzysort.highlight(res[0][0])) //, "<b>", "</b>"));
  // console.log(fuzzysort.highlight(res[0], "<b>", "</b>"));
  // TODO: refactor as a store
  export let fuzzySort: (n: NoteEx) => NoteEx & { priority: number }
  $: if (res && res.length) {
    fuzzySort = (n: NoteEx) => {
      let priority: number
      let searchArt
      if (res && res.length) {
        priority = pipe(
          Array.from(res),
          A.findFirstMap((r) => (r.obj.id == n.id ? O.some(r.score + 1_000_000) : O.none)),
          O.match(() => 0, identity),
        )
        searchArt = pipe(
          Array.from(res),
          A.findFirst((r) => r.obj.id == n.id),
          O.map((optKR) => ({ selectedKey, optKR })),
        )
      } else {
        priority = Date.parse(n.created_at)
        searchArt = O.none
      }

      return { ...n, priority, searchArt }
    }
  } else {
    fuzzySort = (n) => ({ ...n, priority: Date.parse(n.created_at) })
  }
  // $: console.log(selectedKey)
</script>

<div class="flex flex-col content-center">
  <form>
    <input
      type="text"
      placeholder="Type here to search"
      class="input w-full max-w-xs min-w-32"
      bind:value={query} />
    <!-- <button hidden on:click={() => console.log(query, res, selectedKey, $notes.length)}></button> -->
  </form>
  <div>
    <div class="join w-full">
      {#each entries as [ariaLabel, value] (value)}
        <input
          class="join-item btn grow"
          type="checkbox"
          name="options"
          bind:group={selectedKey}
          {value}
          aria-label={ariaLabel} />
        <!-- <input
          class="join-item btn grow"
          type="radio"
          name="options"
          bind:group={selectedKey}
          {value}
          aria-label={ariaLabel}
          on:click={() => (selectedKey = selectedKey == value ? "" : value)} /> -->
      {/each}
    </div>
  </div>
</div>
