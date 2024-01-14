<script lang="ts">
	import type { Session } from '@supabase/gotrue-js';
	export let data;
	import { onMount } from 'svelte';
	import { delete_by_id, getSession, logIfError } from '$lib/utils';
	import Note from '$lib/Note.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { Notes } from '$lib/dbtypes.js';
	let { supabase } = data;
	let session: Session;
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
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!tab.url || !tab.title) return;
		let domain = hostname(tab.url);
		const { data, error } = await supabase
			.from('sources')
			.select('id')
			.eq('domain', domain)
			.eq('title', tab.title)
			.maybeSingle();
		if (!data) {
			console.log('source not there yet probably', error);
			curr_source_id = -1;
			notes = await getNotes();
			return;
		}
		curr_source_id = data?.id;
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
	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		notes = delete_by_id(note_id)(notes);
	};
</script>

{email}<br />{curr_source_id}
{notes.length}
<div class="max-w-xs mx-auto space-y-4">
	{#each notes as note_data, i}
		<Note
			{note_data}
			bind:showing_content={showing_contents[i]}
			{fun}
			deleteit={deleteit(note_data.id)}
		/>
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
