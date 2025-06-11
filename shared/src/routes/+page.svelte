<script lang="ts">
  import "../styles.css"
  export let data
  const { mock } = data
  import { DEBUG, Dashboard, NoteSync, chainN, funLog, windowActive, type SyncLikeNStores } from "$lib"
  import { onMount } from "svelte"
  import { writable } from "svelte/store"
  // import Tagsvify from "$lib/Tagsvify.svelte"
  //   const noteSync = new NoteSync(supabase, undefined, async () => false)

  onMount(async () => {})
  const noop = async (x?: any) => {}
  const noop2 = (x?: any) => noop
  const noteSync: SyncLikeNStores = {
    tagChange: noop2,
    tagUpdate: noop,
    changePrioritised: noop2,
    deleteit: noop,
    undo: noop,
    redo: noop,
    noteStore: writable(mock.notes),
    stuMapStore: writable(mock.stuMap),
  }
</script>

<!-- <button class="btn" on:click={() => {}}>ref</button> -->
<svelte:window on:focus={() => ($windowActive = true)} on:blur={() => ($windowActive = false)} />
<Dashboard {noteSync} />
