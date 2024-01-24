<script lang="ts">
	import type { Notes } from '$lib/dbtypes';
	import type { SupabaseClient } from '$lib/first';
	export let notes: Notes[];
	export let supabase: SupabaseClient;
	import Note from '$lib/shared/Note.svelte';
	import { delete_by_id, logIfError } from '$lib/shared/utils';
	import { gotoSnippet } from '$lib/utils';

	let showing_contents = notes.map((_) => false);
	let close_all_notes = () => {
		showing_contents = showing_contents.map((_) => false);
	};
	let fun = (i: number) => () => {
		close_all_notes();
		let uuid = notes[i].snippet_uuid;
		if (uuid) gotoSnippet(uuid);
	};
	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		notes = delete_by_id(note_id)(notes);
		close_all_notes();
	};
</script>

{#each notes as note_data, i}
	<Note
		{note_data}
		bind:showing_content={showing_contents[i]}
		fun={fun(i)}
		deleteit={deleteit(note_data.id)}
	/>
{:else}
	If you just installed the extension, you need to reload the page.
{/each}
