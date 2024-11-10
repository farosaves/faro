<script lang="ts">
  import fuzzysort from "fuzzysort"
  import { persisted, shortcut } from "$lib"
  import { fzRes, fzSelectedKeys, query, isSearchExact } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"
  import { writable, type Readable } from "svelte/store"
  import { onMount } from "svelte"

  export let noteDeri: NoteDeri
  export let openFirst: Readable<() => void>
  const notes = noteDeri.noteArr
  const possibleSelections = ["sources.title", "quote"]
  const selectedKeys = possibleSelections // : (typeof possibleSelections)[number][]
  const selectedMode = persisted("selectedMode", "Fuzzy")
  const norm = (s: number) => Math.max(s / 5000 + 1, 0) ** 8
  $: fzRes.set(
    !!$query &&
      !$isSearchExact &&
      fuzzysort.go($query, $notes, {
        keys: selectedKeys,
        limit: 15,
        scoreFn: (a) => (a[0] ? norm(a[0].score) : 0) + (a[1] ? norm(a[1].score) : 0),
      }),
  )

  $: fzSelectedKeys.set(selectedKeys)
  $: noteDeri.searching.set($query.length > 0 && focused)
  $: $isSearchExact = $selectedMode === "Exact"
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
      bind:value={$query} />
    <button hidden on:click={() => $query.length && $openFirst()}></button>
  </form>
  <div class="join w-full py-3">
    <input
      class="join-item btn grow btn-sm"
      type="radio"
      name="options"
      bind:group={$selectedMode}
      value="Fuzzy"
      aria-label="Fuzzy search" />
    <input
      class="join-item btn grow btn-sm"
      type="radio"
      name="options"
      bind:group={$selectedMode}
      value="Exact"
      aria-label="Exact search" />
  </div>
</div>
