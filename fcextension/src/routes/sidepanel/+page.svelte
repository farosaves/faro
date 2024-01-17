<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc-client.js';
	import type { Session } from '@supabase/gotrue-js';
	export let data;
	import { onMount } from 'svelte';
	import { delete_by_id, getSession, logIfError } from '$lib/utils';
	import Note from '$lib/Note.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { Notes } from '$lib/dbtypes.js';
	import { scratches } from '$lib/stores.js';
	import { get } from 'svelte/store';
	import { PUBLIC_PI_IP } from '$env/static/public';
	let curr_title = 'Kalanchoe';

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
	const onNoteInsert = (payload: { new: Notes }) => {
		console.log(payload.new);
		notes = [...notes, payload.new];
		showing_contents = [...showing_contents, false];
	};
	let curr_source_id: number = -1;
	let hostname = (s: string) => new URL(s).hostname;
	async function updateActive() {
		try {
			await chrome.tabs.query({ active: true, currentWindow: true });
		} catch {
			console.log('dev?');
			curr_source_id = 15;
			return;
		}
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!tab.url || !tab.title) return;
		curr_title = tab.title;
		let domain = hostname(tab.url);
		// curr_domain_title = [domain, tab.title].join(';');
		// if (!(curr_domain_title in Object.keys(get(scratches))))
		// 	scratches.update((t) => (t[curr_domain_title] = ''));

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
	let n = 0;
	onMount(async () => {
		n = await trpc($page).funsum.query([1, 2, 3, 4, 5, 6]);
		updateActive();
		try {
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
				if (request.action == 'update_curr_url') updateActive();
			});
		} catch {
			console.log('dev?');
		}

		session = (await getSession(supabase)) || redirect(300, PUBLIC_PI_IP); // omg I'm starting to love typescript
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

	let showing_contents = notes.map((_) => false);
	let close_all_notes = () => {
		showing_contents = showing_contents.map((_) => false);
	};
	let deleteit = (note_id: number) => async () => {
		let { error } = await supabase.from('notes').delete().eq('id', note_id).then(logIfError);
		if (error) return;
		notes = delete_by_id(note_id)(notes);
		close_all_notes();
	};
</script>

<div class="max-w-xs mx-auto space-y-4">
	<div class=" text-xl text-center w-full italic">{curr_title} {n}</div>
	{#each notes as note_data, i}
		<Note
			{note_data}
			bind:showing_content={showing_contents[i]}
			fun={close_all_notes}
			deleteit={deleteit(note_data.id)}
		/>
	{:else}
		If you just installed the extension, you need to reload the page.
	{/each}

	<!-- <textarea
		placeholder="scratchy scratch scratch"
		class="w-full"
		bind:value={$scratches[curr_domain_title]}
	/> -->
	<button on:click={() => console.log(get(scratches))}> pls</button>
</div>
