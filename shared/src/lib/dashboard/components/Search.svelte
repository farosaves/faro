<script lang="ts">
  import fuzzysort from "fuzzysort"
  import { shortcut } from "$lib"
  import { array as A } from "fp-ts"
  import { fzRes, fzSelectedKeys } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"
  import type { Readable } from "svelte/store"
  import { onMount } from "svelte"

  export let noteDeri: NoteDeri
  export let openFirst: Readable<() => void>
  const notes = noteDeri.noteArr
  let query = ""
  const possibleSelections = ["sources.title", "quote"]
  const texts = ["Titles", "Text"]
  const entries = A.zip(possibleSelections)(texts)
  let selectedKeys = possibleSelections // : (typeof possibleSelections)[number][]
  const norm = (s: number) => Math.max(s / 5000 + 1, 0) ** 8
  // const norm = (s: number) => s ** 8
  // const go = (
  //   search: string | string[],
  //   targets: readonly (string | Fuzzysort.Prepared)[],
  //   options: Fuzzysort.Options,
  // ) => {
  //   if (!Array.isArray(search)) return fuzzysort.go(search, targets, options)
  //   const r = search
  //     .filter((s, i) => search.indexOf(s) === i)
  //     .flatMap((s) => fuzzysort.go(s, targets, options))
  //     .filter((result, i, results) => i === results.findIndex((r) => r.target === result.target))
  //   return { ...r, total: r.length }
  // }
  $: fzRes.set(
    !!query &&
      fuzzysort.go(query, $notes, {
        keys: selectedKeys,
        limit: 15,
        scoreFn: (a) => (a[0] ? norm(a[0].score) : 0) + (a[1] ? norm(a[1].score) : 0),
      }),
  )
  $: fzSelectedKeys.set(selectedKeys)
  $: noteDeri.searching.set(query.length > 0 && focused)
  const callback = () => document.getElementById("search_input")?.focus()
  let focused = true
  let innerWidth: number
  onMount(() => {
    if (innerWidth >= 900) callback()
  })
</script>

<svelte:window bind:innerWidth />

<div class="flex flex-col content-center">
  <form>
    <!-- svelte-ignore a11y-autofocus -->
    <input
      type="text"
      id="search_input"
      placeholder="Type here to search"
      class="input w-full max-w-xs min-w-32 border-neutral"
      use:shortcut={{ alt: true, code: "KeyF", callback }}
      on:focus={() => (focused = true)}
      on:blur={() => (focused = false)}
      bind:value={query} />
    <button hidden on:click={() => query.length && $openFirst()}></button>
  </form>
  <div class="join w-full py-3">
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
