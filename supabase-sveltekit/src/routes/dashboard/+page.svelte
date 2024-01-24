<script lang="ts">
	import { onMount } from 'svelte';
	import type { Notes } from '$lib/dbtypes.js';
	import Note from '$lib/shared/Note.svelte';
	import { delete_by_id, logIfError } from '$lib/shared/utils.js';
	import { groupBy } from 'fp-ts/lib/NonEmptyArray.js';
	import { toArray } from 'fp-ts/lib/Record.js';
	export let data;
	$: ({ session, supabase } = data);
	let notes: Notes[] = [];
	let showing_contents: boolean[][] = [];
	let note_groups: Notes[][] = [];
	onMount(async () => {
		const { data } = await supabase.from('notes').select().eq('user_id', session?.user.id!);
		notes = data || notes;
		note_groups = toArray(groupBy((n: Notes) => n.source_id.toString())(notes)).map(([a, b]) => b);
		showing_contents = note_groups.map((note_group) => note_group.map((_) => false));
	});
	let close_all_notes = () =>
		(showing_contents = note_groups.map((note_group) => note_group.map((_) => false)));
	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		notes = delete_by_id(note_id)(notes);
		close_all_notes();
	};
	// let f =
</script>

<div class="flex flex-row flex-wrap">
	{#each note_groups as note_group, i}
		<div class="flex flex-row flex-wrap border-2">
			{#each note_group as note, j}
				<Note
					note_data={note}
					bind:showing_content={showing_contents[i][j]}
					fun={close_all_notes}
					deleteit={deleteit(note.id)}
				/>
			{/each}
		</div>
	{/each}
</div>
