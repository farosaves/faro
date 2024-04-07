<script lang="ts">
  //   import { onMount } from "svelte"
  export let data
  import { page } from "$app/stores"
  import { NoteSync, funLog, sleep } from "shared"
  import { get } from "svelte/store"
  import { record as R, map as M } from "fp-ts"
  import type { UUID } from "crypto"
  import { onMount } from "svelte"

  let noteId: string

  const { params } = get(page)
  console.log(data.session?.user.id)
  const { noteStore, stuMapStore } = new NoteSync(data.supabase, data.session?.user.id)
  const n = get(noteStore).get("3e88b49c-aa4e-47b5-b356-5c38f1a6ac0d")
  const a = get(stuMapStore).get((n?.source_id as UUID) || "")

  //   R.lookup(noteId,
  let div: HTMLDivElement
  onMount(async () => {
    // const url = JSON.stringify("https://en.wikipedia.org/wiki/Kalanchoe")
    const url = "https://en.wikipedia.org/wiki/Kalanchoe"
    div.innerHTML = await fetch(`/api/forward/?url=${url}&main=true`).then((x) => x.text())
    const stylesheetLinks = Array.from(div.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[]

    //   fetch('http://www.example.com/external-styles.css')
    // .then(response => response.text())
    // .then(css => {
    //   const styleElement = document.createElement('style');
    //   styleElement.textContent = css;
    //   document.head.appendChild(styleElement);

    sleep(100)
    console.log("ps", document.getElementsByTagName("p").length)
    for (const link of stylesheetLinks) {
      // const resp = await fetch(JSON.stringify(link.href)).then()
      // resp.text().then(funLog("reps text"))
    }

    // fetch("https://en.wikipedia.org/wiki/Kalanchoe")
    //   .then((response) => response.text())
    //   .then((html) => {
    //     div.innerHTML = html
    //   })
    //   .catch((error) => console.error("Error:", error))
  })
</script>

<svelte:window on:mouseup={() => console.log(window.getSelection())} />

<div bind:this={div}></div>

<!-- <iframe width="100%" height="1000px" src={a?.url} /> -->

<!-- {JSON.stringify([...get(noteStore).keys()])} -->
