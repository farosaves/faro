<script lang="ts">
	import type { Session } from '@supabase/gotrue-js';
	export let data;
	import { onMount } from 'svelte';
	import { getSession } from '$lib/utils';
	import Note from '$lib/Note.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { Notes } from '$lib/dbtypes.js';
	let { supabase } = data;
	let session: Session;
	$: ss = { supabase, session };
	async function getNotes() {
		const { data, error } = await supabase
			.from('notes')
			.select()
			.eq('source_id', curr_source_id)
			.eq('user_id', session.user.id);
		error && console.log('getNotes error', error);
		console.log(data);
		return data ?? [];
	}
	let notes: Notes[] = [];
	// $: console.log('notes', notes);
	const onNoteInsert = (payload: { new: Notes }) => {
		console.log(payload.new);
		notes = [...notes, payload.new];
		showing_contents = [...showing_contents, false];
	};
	let curr_source_id: number = -1;
	let hostname = (s: string) => new URL(s).hostname;
	async function updateActive() {
		curr_source_id = 4;
		notes = await getNotes();
	}

	onMount(async () => {
		updateActive();

		session = (await getSession(supabase)) || redirect(300, DOMAIN); // omg I'm starting to love typescript
		notes = await getNotes();
		supabase
			.channel('notes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notes',
					filter: `user_id=eq.${session.user.id}`
				}, // at least url should be the same so no need to filter
				onNoteInsert
			)
			.subscribe();
	});
	$: email = session ? session.user.email : 'none@none';

	const DOMAIN = 'http://localhost:5173';
	let showing_contents = notes.map((_) => false);
	let fun = () => {
		showing_contents = showing_contents.map((_) => false);
	};
</script>

{email}<br />{curr_source_id}
{notes.length}
<div class="max-w-xs mx-auto space-y-4">
	{#each notes as note_data, i}
		<Note {ss} {note_data} bind:showing_content={showing_contents[i]} {fun} />
	{:else}
		If you just installed the extension, you need to reload the page.
	{/each}

	<!-- <div class=" form-widget">
		<input class="text-xl" bind:value={website_title} />
		<input class="resize-y" bind:value={text} />
		<button class="btn-primary btn" on:click={async () => console.log(await getNotes())}
			>Get notes</button
		>
	</div> -->
	<textarea class="w-full"> pepe... </textarea>
</div>
