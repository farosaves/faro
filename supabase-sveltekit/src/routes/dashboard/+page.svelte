<script lang="ts">
	import { onMount } from 'svelte';
	import type { Notes } from '$lib/dbtypes.js';
	import Note from '$lib/shared/Note.svelte';
	import { delete_by_id, logIfError } from '$lib/shared/utils.js';
	export let data;
	$: ({ session, supabase } = data);
	let notes: Notes[] = [];
	let showing_contents: boolean[] = [];
	onMount(async () => {
		const { data } = await supabase.from('notes').select().eq('user_id', session?.user.id!);
		notes = data || notes;
		showing_contents = notes.map((_) => false);
	});
	let close_all_notes = () => (showing_contents = notes.map((_) => false));
	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		notes = delete_by_id(note_id)(notes);
		close_all_notes();
	};
</script>

<div class="grid grid-cols-5 w-full">
	{#each notes as note, i}
		<Note
			note_data={note}
			bind:showing_content={showing_contents[i]}
			fun={close_all_notes}
			deleteit={deleteit(note.id)}
		/>
	{/each}
</div>
