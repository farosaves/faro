<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc-client.js';
	import type { Session } from '@supabase/gotrue-js';
	export let data;
	import { onMount } from 'svelte';
	import { API_ADDRESS, delete_by_id, getSession, logIfError } from '$lib/utils';
	import Note from '$lib/Note.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { Notes } from '$lib/dbtypes.js';
	import { scratches } from '$lib/stores.js';
	import { get } from 'svelte/store';
	import { _getNotes } from './util.js';
	let getNotes = () => _getNotes(supabase, curr_source_id, user_id);
	let curr_title = 'Kalanchoe';

	let { supabase } = data;
	let session: Session | undefined;
	$: user_id = session?.user.id || '';
	let notes: Notes[] = [];
	const onNoteInsert = (payload: { new: Notes }) => {
		notes = [...notes, payload.new];
		showing_contents = [...showing_contents, false];
	};
	let curr_source_id: number = -1;
	let hostname = (s: string) => new URL(s).hostname;
	let curr_domain_title = '';
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
		curr_domain_title = [domain, tab.title].join(';');
		if (!(curr_domain_title in $scratches))
			scratches.update((t) => {
				t[curr_domain_title] = '';
				return t;
			});

		const { data, error } = await supabase
			.from('sources')
			.select('id')
			.eq('domain', domain)
			.eq('title', tab.title)
			.maybeSingle();
		if (!data) {
			console.log('source not there yet probably', error);
			curr_source_id = -1;
			notes = [];
			return;
		}
		curr_source_id = data?.id;
		notes = await getNotes();
		console.log('scratches', $scratches);
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
		let atokens = await trpc($page).my_email.query();
		atokens || window.open(API_ADDRESS);
		session = (await getSession(supabase, atokens)) || undefined; // || redirect(300, API_ADDRESS); // omg I'm starting to love typescript
		notes = await getNotes();
		supabase
			.channel('notes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notes',
					filter: `user_id=eq.${user_id}`
				}, // at least url should be the same so no need to filter
				onNoteInsert
			)
			.subscribe();
	});
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

{#if !user_id}
	<div role="alert" class="alert alert-error">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="stroke-current shrink-0 h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/></svg
		>
		<span>Not logged in! <a href={API_ADDRESS} target="_blank">click here</a></span>
	</div>
{/if}

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

	<textarea
		placeholder="scratchy scratch scratch"
		class="w-full"
		bind:value={$scratches[curr_domain_title]}
	/>
	<button on:click={() => console.log(get(scratches))}> pls</button>
</div>
