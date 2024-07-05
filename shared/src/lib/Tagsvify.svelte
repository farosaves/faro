<script lang="ts">
  import "@yaireo/tagify/dist/tagify.css"
  import { onMount } from "svelte"
  import Tagify from "@yaireo/tagify"

  export let whitelist: string[] = []
  export const id = "t_" + crypto.randomUUID()
  let inputElem: HTMLInputElement
  let tagify: Tagify
  onMount(() => {
    tagify = new Tagify(inputElem, {
      // A list of possible tags. This setting is optional if you want to allow
      // any possible tag to be added without suggesting any to the user.
      whitelist: whitelist,
      dropdown: { enabled: 1 },
    })
    tagify.on("add", () => console.log(tagify.getCleanValue()))
  })
  $: tagify && (tagify.whitelist = whitelist)
</script>

<input class="text-left w-full" bind:this={inputElem} {id} />
