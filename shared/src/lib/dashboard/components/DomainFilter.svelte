<script lang="ts">
  import { derived, writable } from "svelte/store"
  import { record as R, option as O, nonEmptyArray as NA, tuple } from "fp-ts"
  import { pipe } from "fp-ts/lib/function"
  import { desc, isCmd, replacer } from "$lib"
  import { fzRes, uncheckedDomains } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"
  import { onMount } from "svelte"
  import fuzzysort from "fuzzysort"
  export let noteDeri: NoteDeri
  const domains = derived(noteDeri.noteArr, (x) =>
    pipe(
      x,
      NA.groupBy((n) => n.sources.domain),
      R.map((ns) => ns.length),
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  )
  const toggleDomain = (domain: string) => {
    $uncheckedDomains.has(domain) ? $uncheckedDomains.delete(domain) : $uncheckedDomains.add(domain)
    $uncheckedDomains = $uncheckedDomains // store signal
  }
  const toggleAll = () => {
    if ($uncheckedDomains.size > 0) $uncheckedDomains = new Set()
    else $uncheckedDomains = new Set($domains.map(([x, y]) => x))
  }
  const makeOnly = (domain: string) =>
    ($uncheckedDomains = new Set($domains.map(([x, y]) => x).filter((t) => t != domain)))

  let details: HTMLDetailsElement
  onMount(() => {
    details = document.getElementById("details") as HTMLDetailsElement
    setTimeout(() => (details.open = !!$uncheckedDomains.size), 200)
  })
  const hi = (r: Fuzzysort.Result) => fuzzysort.highlight(r, replacer)?.join("") || ""
  const queryStore = writable("")
  const res = derived([queryStore, domains], ([query, d]) =>
    query
      ? fuzzysort
          .go(
            query,
            d.map(([domain, count]) => ({ domain, count })),
            {
              limit: 15,
              key: "domain",
            },
          )
          .toSorted(desc((x) => x.score))
          .map((r) => ({ displayed: hi(r), ...r.obj }))
      : d.map(([domain, count]) => ({ domain, count, displayed: domain })),
  )
</script>

<details id="details" class="flex">
  <summary class="mb-2"> Sites </summary>
  <form>
    <!-- svelte-ignore a11y-autofocus -->
    <input
      type="text"
      id="search_input"
      autofocus
      placeholder="Search sites"
      class="input input-sm w-56 max-w-xs border-neutral mx-auto block mb-2"
      bind:value={$queryStore} />
    <button hidden on:click={() => $queryStore.length && console.log("hey")}></button>
  </form>

  <div class="join join-vertical bg-base-200 w-56 m-auto">
    {#if !$queryStore.length}
      <button
        class="btn btn-neutral btn-sm text-nowrap join-item w-full"
        on:click={toggleAll}
        class:btn-outline={$uncheckedDomains.size}>
        Toggle All
      </button>
    {/if}

    {#each $res as { domain, count, displayed }, i}
      <div class="tooltip tooltip-top tooltip-secondary p-0 join-item" data-tip={count}>
        <button
          class="btn btn-neutral btn-sm text-nowrap join-item w-full gap-0"
          on:click={(e) => (e.shiftKey || isCmd(e) ? toggleDomain(domain) : makeOnly(domain))}
          class:btn-outline={$uncheckedDomains.has(domain)}>
          {@html displayed}
        </button>
      </div>
    {/each}
  </div>
</details>
