<script lang="ts">
  // import "@yaireo/tagify/dist/tagify.css"
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
      dropdown: { enabled: 1 },
    })
  })
  $: tagify && (tagify.whitelist = whitelist)
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
    console.log(currentTarget.value)
    const newTags = JSON.parse(currentTarget.value).map(f)
    tags = newTags
    onTagsChange(tags)
  }} />
