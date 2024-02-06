<script lang="ts">
	import type { Notes } from '$lib/dbtypes';
	import Note from '$lib/shared/_Note.svelte';
	export let w_rem = 16;
	export let note_data: Notes;
	export let showing_content: boolean;
	export let close_all_notes: MouseEventHandler<any>;
	export let note_sync: NoteSync;
	import _Note from '$lib/shared/_Note.svelte';
	import type { NoteSync } from '$lib/shared/note-sync';
	import type { MouseEventHandler } from 'svelte/elements';
	let goto_function: MouseEventHandler<any>; // = () => gotoSnippet(note_data.snippet_uuid!);
</script>

<div style="max-width: {w_rem}rem; min-width: {w_rem}rem">
	<Note {note_data} bind:showing_content {close_all_notes} {note_sync} {goto_function} />
</div>
