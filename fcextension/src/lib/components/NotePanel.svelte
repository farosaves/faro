<script lang="ts">
	import type { Notes } from '$lib/dbtypes';
	import type { SupabaseClient } from '$lib/first';
	// export let notes: Notes[];
	import type { NoteSync } from '../note-sync';
	export let note_sync: NoteSync;
	let note_store = note_sync.notestore;
	export let supabase: SupabaseClient;
	export let source_id: number;
	// let notes = note_store.panel(source_id);
	import Note from '$lib/components/Note.svelte';
	import { delete_by_id, logIfError } from '$lib/shared/utils';
	if (!(source_id in $note_store)) $note_store[source_id] = [];
	let showing_contents = $note_store[source_id].map((_) => false);
	let close_all_notes = () => {
		showing_contents = showing_contents.map((_) => false);
	};
	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		$note_store[source_id] = delete_by_id(note_id)($note_store[source_id]);
		close_all_notes();
	};
</script>

{#each $note_store[source_id] as note_data, i}
	<Note
		{note_data}
		bind:showing_content={showing_contents[i]}
		{close_all_notes}
		deleteit={deleteit(note_data.id)}
	/>
{:else}
	If you just installed the extension, you need to reload the page.
{/each}
