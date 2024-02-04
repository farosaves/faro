<script lang="ts">
	import { onMount } from 'svelte';
	import Note from '$lib/components/Note.svelte';
	import { NoteSync } from '$lib/shared/note-sync.js';
	import Search from '$lib/components/Search.svelte';
	export let data;
	$: ({ session, supabase } = data);

	let showing_contents: boolean[][];
	let note_sync: NoteSync = new NoteSync(supabase, undefined);
	let note_groups = note_sync.get_groups();
	onMount(async () => {
		note_sync.user_id = session?.user.id;
		note_sync.sb = supabase;
		// console.log(supabase, note_sync.user_id);
		note_sync.update_all_pages();
		console.log(search);
	});

	let close_all_notes = () => {
		showing_contents = $note_groups.map(([t, note_group]) => note_group.map((_) => false));
	};
	close_all_notes();

	let search: {
		query: string;
		byTags: boolean;
		byTitles: boolean;
		byText: boolean;
	};
</script>

{session?.user.email}
<label for="my-drawer" class="btn btn-primary drawer-button">Open drawer</label>
<div class="drawer lg:drawer-open">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<!-- my main here -->
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
								{note_sync}
							/>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="drawer-side">
		<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
			<!-- Sidebar content here -->
			<li>
				<Search bind:search />
			</li>
			<li>Sidebar Item 2</li>
		</ul>
	</div>
</div>
