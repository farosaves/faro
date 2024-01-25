<script lang="ts">
	import { onMount } from 'svelte';
	import type { Notes } from '$lib/dbtypes.js';
	import Note from '$lib/shared/Note.svelte';
	import { delete_by_id, logIfError } from '$lib/shared/utils.js';
	import { groupBy, type NonEmptyArray } from 'fp-ts/lib/NonEmptyArray.js';
	import { toArray } from 'fp-ts/lib/Record.js';
	import { pipe } from 'fp-ts/lib/function.js';
	export let data;
	$: ({ session, supabase } = data);
	let notes: (Notes & { sources: { title: string } })[] = [];
	let showing_contents: boolean[][] = [];
	let note_groups: [string, Notes[]][] = [];
	onMount(async () => {
		const { data } = await supabase
			.from('notes')
			.select('*, sources (title)')
			.eq('user_id', session?.user.id!);
		notes = data || notes;
		note_groups = await noteGroups(notes);
		showing_contents = note_groups.map((note_group) => note_group.map((_) => false));
	});
	let close_all_notes = () =>
		(showing_contents = note_groups.map((note_group) => note_group.map((_) => false)));
	let noteGroups = async (notes: (Notes & { sources: { title: string } })[]) =>
		pipe(
			notes,
			groupBy((n) => n.sources.title),
			toArray
		);

	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		notes = delete_by_id(note_id)(notes);
		note_groups = await noteGroups(notes);
		showing_contents = note_groups.map((note_group) => note_group.map((_) => false));
	};
</script>

<div class="flex flex-row flex-wrap border-2 border-sky-600">
	{#each note_groups as [title, note_group], i}
		<div class="border-2 text-center">
			<span class="text-lg text-wrap">{title}</span>
			<div class="flex flex-row flex-wrap">
				{#each note_group as note, j}
					<Note
						note_data={note}
						bind:showing_content={showing_contents[i][j]}
						fun={close_all_notes}
						deleteit={deleteit(note.id)}
					/>
				{/each}
			</div>
		</div>
	{/each}
</div>
