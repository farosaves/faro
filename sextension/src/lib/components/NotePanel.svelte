<script lang="ts">
  import type { NoteDeri, Notes, SyncLike } from "shared"
  import Note from "$lib/components/Note.svelte"
  import { option as O, array as A, string as S, eq } from "fp-ts"
  import { altKey, asc, createMock, extractCharIdx, funLog, type PendingNote } from "shared"
  import { flow, pipe } from "fp-ts/lib/function"
  import type { NoteMut } from "$lib/note_mut"
  import { derived, type Readable } from "svelte/store"
  import { optimistic } from "$lib/stores"
  import { loc } from "$lib/utils"

  export let windowId: Readable<number>
  export let syncLike: SyncLike & Pick<NoteMut, "panels"> & Pick<NoteDeri, "allTags">
  const notePanel = derived([syncLike.panels, windowId], ([p, id]) =>
    (p.get(id) || []).toSorted(asc((t) => extractCharIdx(t.serialized_highlight!))),
  )

  // prettier-ignore
  const mocked = derived(optimistic, O.map((r) => { return { ...r, ...createMock() } }))
  mocked.subscribe(funLog("mocked"))
  const withMocked = derived([notePanel, mocked], ([a, b]) =>
    pipe([...a, ...A.fromOption(b)], A.uniq(eq.contramap<string, Notes>((n) => n.snippet_uuid || "")(S.Eq))),
  )
  withMocked.subscribe(funLog("withMocked"))

  let noteOpens = ($notePanel || []).map((_) => false)
  let closeAll = () => {
    noteOpens = noteOpens.map((_) => false)
  }
</script>

{#each $withMocked as note_data, i}
  <Note note_data={{ ...note_data, searchArt: O.none }} bind:isOpen={noteOpens[i]} {closeAll} {syncLike} />
{:else}
  <div class="w-full text-center">
    {loc("noSavesYet")}...<br />
    <div class="underline tooltip" data-tip="{loc('howToExpl')} {altKey} + X">
      {loc("howToAdd")}
    </div>
  </div>
{/each}
