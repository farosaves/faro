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
			.eq('user_id', session.user.id)
			.eq('origin_website', curr_url);
		error && console.log('getNotes error', error);
		return data ?? [];
	}
	let notes: Notes[] = [];

	const onNoteInsert = (payload: { new: Notes }) => {
		console.log(payload.new);
		notes = [...notes, payload.new];
		showing_contents = [...showing_contents, false];
	};
	let curr_url = 'pending...';
	async function updateActive() {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tab.url) curr_url = tab.url;
		notes = await getNotes();
	}

	onMount(async () => {
		updateActive();
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.action == 'update_curr_url') updateActive();
		});
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

{email}<br />{curr_url}
<div class="max-w-xs mx-auto space-y-4">
	{#each notes as note_data, i}
		<Note {ss} {note_data} bind:showing_content={showing_contents[i]} {fun} />
	{/each}

	<!-- <div class=" form-widget">
		<input class="text-xl" bind:value={website_title} />
		<input class="resize-y" bind:value={text} />
		<button class="btn-primary btn" on:click={async () => console.log(await getNotes())}
			>Get notes</button
		>
	</div> -->
</div>
