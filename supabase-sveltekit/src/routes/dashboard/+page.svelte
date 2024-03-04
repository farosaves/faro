<script lang="ts">
  import { onMount } from "svelte";
  import Note from "$lib/components/Note.svelte";
  import { NoteSync } from "shared";
  // import { NoteSync } from "shared";
  import Search from "$lib/components/Search.svelte";
  import type { NoteEx } from "shared";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import DomainFilter from "$lib/components/DomainFilter.svelte";
  import { identity, flow } from "fp-ts/lib/function";
  import { redirect } from "@sveltejs/kit";
  import LoginPrompt from "$lib/components/LoginPrompt.svelte";
  import { option as O } from "fp-ts";
  import { handlePayload, type NoteFilter } from "$lib/utils";
  import { sessStore } from "shared";
  export let data;
  $: ({ session: _session, supabase } = data);
  $: if (_session) $sessStore = O.some(_session);
  $: session = $sessStore;

  let showing_contents: boolean[][];
  let note_sync: NoteSync = new NoteSync(supabase, undefined);
  let filterSortFun = (n: NoteEx) => {
    return { ...n, priority: Date.parse(n.created_at) };
  };
  let tagFilter: NoteFilter = identity;
  let domainFilter: NoteFilter = identity;
  let note_groups = note_sync.get_groups(
    flow(filterSortFun, tagFilter, domainFilter),
  );
  $: note_groups = note_sync.get_groups(
    flow(filterSortFun, tagFilter, domainFilter),
  );
  onMount(async () => {
    session || redirect(302, "login");
    note_sync.user_id = O.toNullable(session)?.user.id;
    note_sync.sb = supabase;
    note_sync.sb
      .channel("notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${note_sync.user_id}`,
        }, // at least url should be the same so no need to filter
        handlePayload(note_sync),
      )
      .subscribe();
    note_sync.update_all_pages();
  });

  let close_all_notes = () => {
    showing_contents = $note_groups.map(([t, note_group]) =>
      note_group.map((_) => false),
    );
  };
  close_all_notes();
  let safeget = <T,>(a: T[][], i: number) => (i in a ? a[i] : []);

  let w_rem = 16;
  let all_notes = note_sync.notestore;
  $: flat_notes = Object.entries($all_notes).flatMap(([s, v]) => v);
  const handle_keydown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "z") {
      e.preventDefault();
      note_sync.restoredelete();
      // (e.shiftKey ? redo : undo)();
    }
  };
</script>

<svelte:window on:keydown={handle_keydown} />
<LoginPrompt {session} />
{Object.entries($all_notes).flatMap(([a, b]) => b).length}
<label for="my-drawer" class="btn btn-primary drawer-button md:hidden">
  Open drawer</label>
<div class="drawer md:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content z-0">
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
    <!-- class:hidden={get(note_sync.note_del_queue).length == 0}> -->
    <div class="toast toast-end z-10">
      <!-- {$note_del_queue.length} -->
      <div class="alert alert-info">
        <button on:click={note_sync.restoredelete}>Undo last delete.</button>
      </div>
    </div>
  </div>
  <div class="drawer-side z-10">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul class="menu p-4 w-72 min-h-full bg-base-200 text-base-content">
      <li>
        <Search bind:filterSortFun notes={flat_notes} />
      </li>
      <li><TagFilter all_tags={note_sync.alltags()} bind:tagFilter /></li>
      <li><DomainFilter {note_sync} bind:domainFilter /></li>
    </ul>
  </div>
</div>
