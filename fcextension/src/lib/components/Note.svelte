<script lang="ts">
	import type { Notes } from '$lib/dbtypes';
	import Note from '$lib/shared/_Note.svelte';

	export let note_data: Notes;
	export let showing_content: boolean;
	export let close_all_notes: MouseEventHandler<any>;
	export let deleteit: MouseEventHandler<any>;

	import _Note from '$lib/shared/_Note.svelte';
	import { gotoSnippet } from '$lib/utils';
	import type { MouseEventHandler } from 'svelte/elements';

	let goto_function = () => gotoSnippet(note_data.snippet_uuid!);
</script>

<Note {note_data} bind:showing_content {close_all_notes} {deleteit} {goto_function} />
