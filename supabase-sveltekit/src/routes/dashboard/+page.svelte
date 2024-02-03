<script lang="ts">
	import { onMount } from 'svelte';
	import Note from '$lib/components/Note.svelte';
	import { NoteSync } from '$lib/shared/note-sync.js';
	export let data;
	$: ({ session, supabase } = data);

	let showing_contents: boolean[][] = [];
	let note_sync: NoteSync = new NoteSync(supabase, undefined);
	let note_groups = note_sync.get_groups();
	onMount(async () => {
		note_sync.user_id = session?.user.id;
		note_sync.sb = supabase;
		// console.log(supabase, note_sync.user_id);
		note_sync.update_all_pages();
	});

	let close_all_notes = () => {
		showing_contents = $note_groups.map((note_group) => note_group.map((_) => false));
	};
</script>

{session?.user.email}
<div class="flex flex-row flex-wrap border-2 border-sky-600">
	{#each $note_groups as [title, note_group], i}
		<div class="border-2 text-center">
			<span class="text-lg text-wrap">{title}</span>
			<div class="flex flex-row flex-wrap overflow-auto">
				{#each note_group as note, j}
					<Note
						note_data={note}
						bind:showing_content={showing_contents[i][j]}
						{close_all_notes}
						deleteit={note_sync.deleteit(note)}
					/>
				{/each}
			</div>
		</div>
	{/each}
</div>
