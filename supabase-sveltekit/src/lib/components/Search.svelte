<script lang="ts">
  import fuzzysort from "fuzzysort"
  import { shortcut, type NoteEx, type NoteSync, idx, escapeHTML, replacer } from "shared"
  import { array as A, option as O } from "fp-ts"
  import { identity, pipe } from "fp-ts/lib/function"
  import { onMount } from "svelte"
  import { page } from "$app/stores"

  export let note_sync: NoteSync
  const notes = note_sync.noteArr
  let query = ""
  const possibleSelections = ["sources.title", "quote"]
  const texts = ["Titles", "Text"]
  const entries = A.zip(possibleSelections)(texts)
  let selectedKey = possibleSelections // : (typeof possibleSelections)[number][]
  $: res = !!query && fuzzysort.go(query, $notes, { keys: selectedKey, limit: 25 })
  export let fuzzySort: (n: NoteEx) => NoteEx & { priority: number }
  $: if (res && res.length) {
    fuzzySort = (n: NoteEx) => {
      let priority: number
      let searchArt
      let title: string
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
        // todo this is almost the same as one in shared _Note
        title = pipe(
          searchArt,
          O.chain(({ selectedKey, optKR }) =>
            pipe(
              selectedKey,
              A.findIndex((n) => n == "sources.title"),
              O.chain((i) => idx(optKR, i)),
              O.map((r) => {
                const target = escapeHTML(r.target)
                return fuzzysort.highlight({ ...r, target }, $replacer)?.join("")
              }),
              O.chain(O.fromNullable),
            ),
          ),
          O.getOrElse(() => n.sources.title),
        )
      } else {
        priority = Date.parse(n.created_at)
        searchArt = O.none
        title = n.sources.title
      }
      const sources = { url: n.sources.url, title }
      return { ...n, priority, searchArt, sources }
    }
  } else {
    fuzzySort = (n) => ({ ...n, priority: Date.parse(n.created_at) })
  }
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
    <button hidden on:click={() => console.log(query, res, selectedKey, $notes.length)}></button>
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
