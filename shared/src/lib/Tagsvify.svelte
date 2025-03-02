<script lang="ts">
  import "./tagify.scss"
  import { onMount } from "svelte"
  import Tagify from "@yaireo/tagify"

  export let whitelist: string[] = []
  export let tags: string[] = []
  const initTags = tags
  export let onTagsChange: (tags: string[]) => void
  export const id = "t_" + crypto.randomUUID()
  let inputElem: HTMLInputElement
  let tagify: Tagify
  onMount(() => {
    tagify = new Tagify(inputElem, {
      whitelist: whitelist,
      dropdown: { enabled: 0 },
    })
    tagify.on("input", (e) => {
      const value = "value" in e.detail ? e.detail.value : ""
      tagify.whitelist = value.length ? whitelist : whitelist.slice(0, 1)
      tagify.dropdown.show(value)
    })
    tagify.on("focus", (_e) => {
      tagify.whitelist = whitelist.slice(0, 1)
    })
  })
  // tagify.DOM.originalInput.addEventListener('change', onTagsChange)

  const f = (x: { value: string }) => x.value
</script>

<!-- <button on:click={() => console.log("vals")}>Hi</button> -->
<input
  class="w-full"
  bind:this={inputElem}
  value={initTags.join(", ")}
  {id}
  on:change={({ currentTarget }) => {
    // console.log(currentTarget.value)
    const newTags = currentTarget.value ? JSON.parse(currentTarget.value).map(f) : [] // dont parse empty string
    tags = newTags
    onTagsChange(tags)
  }} />

<style>
  @media (prefers-color-scheme: dark) {
    :global(.tagify__dropdown) {
      background: #333;
      color: #fff;
    }
    :global(.tagify__dropdown__item) {
      color: #eee;
    }
    :global(.tagify__dropdown__item--active) {
      background: #555;
    }
  }
</style>
