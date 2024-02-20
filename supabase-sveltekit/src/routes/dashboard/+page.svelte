<script lang="ts">
  import { onMount } from "svelte";
  import Note from "$lib/components/Note.svelte";
  import { NoteSync } from "$lib/shared/note-sync.js";
  import Search from "$lib/components/Search.svelte";
  import { sub } from "$lib/stores.js";
  import type { NoteEx } from "$lib/shared/first.js";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import { identity, flow } from "fp-ts/lib/function";
  import { redirect } from "@sveltejs/kit";
  import LoginPrompt from "$lib/components/LoginPrompt.svelte";
  import { option as O } from "fp-ts";
  export let data;
  $: ({ session, supabase } = data);
  $: sessOpt = O.fromNullable(session);

  let showing_contents: boolean[][];
  let note_sync: NoteSync = new NoteSync(supabase, undefined);
  let filterSortFun = (n: NoteEx) => {
    return { ...n, priority: Date.parse(n.created_at) };
  };
  let tagFilter: (
    n: NoteEx & { priority: number },
  ) => NoteEx & { priority: number } = identity;
  let note_groups = note_sync.get_groups(flow(filterSortFun, tagFilter));
  $: note_groups = note_sync.get_groups(flow(filterSortFun, tagFilter));
  onMount(async () => {
    session || redirect(302, "login");
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

  let w_rem = 16;
  let all_notes = note_sync.notestore;
  $: flat_notes = Object.entries($all_notes).flatMap(([s, v]) => v);
</script>

<LoginPrompt session={sessOpt} />
<label for="my-drawer" class="btn btn-primary drawer-button md:hidden">
  Open drawer</label>
<div class="drawer md:drawer-open">
  <!-- md:drawer-open -->
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- my main here -->
    <div class="flex flex-row flex-wrap">
      {#each $note_groups as [title, note_group], i}
        <div
          class="border-2 text-center border-secondary rounded-lg"
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
      <li>
        <Search bind:filterSortFun notes={flat_notes} />
      </li>
      <li><TagFilter all_tags={note_sync.alltags()} bind:tagFilter /></li>
    </ul>
  </div>
</div>
