<script lang="ts">
	import type { NoteSync } from '../shared/note-sync';
	export let note_sync: NoteSync;
	let note_store = note_sync.notestore;
	export let source_id: number;
	import Note from '$lib/components/Note.svelte';
	if (!(source_id in $note_store)) $note_store[source_id] = [];
	let showing_contents = $note_store[source_id].map((_) => false);
	let close_all_notes = () => {
		showing_contents = showing_contents.map((_) => false);
	};
</script>

{#each $note_store[source_id] as note_data, i}
	<Note
		{note_data}
		bind:showing_content={showing_contents[i]}
		{close_all_notes}
		deleteit={note_sync.deleteit(note_data)}
	/>
{:else}
	If you just installed the extension, you need to reload the page.
{/each}
