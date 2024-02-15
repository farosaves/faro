<script lang="ts">
  import { onMount } from "svelte";
  import Note from "$lib/components/Note.svelte";
  import { NoteSync } from "$lib/shared/note-sync.js";
  import Search from "$lib/components/Search.svelte";
  import { sub } from "$lib/stores.js";
  export let data;
  $: ({ session, supabase } = data);

  let showing_contents: boolean[][];
  let note_sync: NoteSync = new NoteSync(supabase, undefined);
  let note_groups = note_sync.get_groups((n) => {
    return { ...n, priority: Date.parse(n.created_at) };
  });
  onMount(async () => {
    note_sync.user_id = session?.user.id;
    note_sync.sb = supabase;
    sub(note_sync);
    note_sync.update_all_pages();
  });

  let close_all_notes = () => {
    showing_contents = $note_groups.map(([t, note_group]) =>
      note_group.map((_) => false),
    );
  };
  let safeget = <T,>(a: T[][], i: number) => (i in a ? a[i] : []);
  close_all_notes();

  // let search: {
  // 	query: string;
  // 	byTags: boolean;
  // 	byTitles: boolean;
  // 	byText: boolean;
  // };
  let w_rem = 16;
</script>

<label for="my-drawer" class="btn btn-primary drawer-button hidden">
  Open drawer</label>
<div class="drawer">
  <!-- md:drawer-open -->
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- my main here -->
    <div class="flex flex-row flex-wrap border-2 border-sky-600">
      {#each $note_groups as [title, note_group], i}
        <div
          class="border-2 text-center"
          style="max-width: {(w_rem + 0.15) * note_group.length}rem; 
				min-width: {w_rem + 0.15}rem">
          <span class="text-lg text-wrap">{title}</span>
          <div class="flex flex-row flex-wrap overflow-auto">
            {#each note_group as note, j}
              <!-- bind:showing_content={showing_contents[i][j]} -->
              <Note
                note_data={note}
                showing_content={safeget(showing_contents, i)[j]}
                {close_all_notes}
                {note_sync}
                {w_rem} />
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div class="toast toast-end">
      <div class="alert alert-info">
        <button on:click={note_sync.restoredelete}
          >Deleted. Click to undo</button>
      </div>
    </div>
  </div>
  <div class="drawer-side">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul class="menu p-4 w-72 min-h-full bg-base-200 text-base-content">
      <!-- Sidebar content here -->
      <li>
        <Search notes={$note_groups.flatMap(([, v]) => v)} />
      </li>
      <li>Sidebar Item 2</li>
    </ul>
  </div>
</div>
