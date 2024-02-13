<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc-client.js';
	import type { Session } from '@supabase/gotrue-js';
	export let data;
	import { onMount } from 'svelte';
	import { API_ADDRESS, getSession } from '$lib/utils';
	import { getSourceId, scratches, sub } from '$lib/stores';
	import { NoteSync } from '$lib/shared/note-sync.js';
	import { get, type Readable } from 'svelte/store';
	import NotePanel from '$lib/components/NotePanel.svelte';
	import { mock } from './util.js';
	import Pako from 'pako';
	let curr_title = 'Kalanchoe';
	let curr_url = '';
	let { supabase } = data;
	let session: Session;
	let note_sync: NoteSync = new NoteSync(supabase, undefined);
	let source_id: Readable<number>;
	let hostname = (s: string) => new URL(s).hostname;
	let curr_domain_title = '';

	function getHighlight(source_id: number, tab_id: number) {
		chrome.tabs.sendMessage(tab_id, {
			action: 'deserialize',
			uss: (get(note_sync.notestore)[source_id] || []).map((n) => [
				n.snippet_uuid,
				n.serialized_highlight
			])
		});
	}

	async function updateActive() {
		let tab;
		try {
			[tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		} catch {
			console.log('dev?');
			source_id = await getSourceId(supabase)('a', 'a');
			return;
		}
		if (!tab.url || !tab.title || !tab.id) return;
		curr_title = tab.title;
		curr_url = tab.url;
		let domain = hostname(tab.url);
		curr_domain_title = [domain, tab.title].join(';');
		if (!(curr_domain_title in $scratches))
			scratches.update((t) => {
				t[curr_domain_title] = '';
				return t;
			});
		source_id = await getSourceId(supabase)(domain, curr_title);
		await note_sync.update_one_page($source_id);
		getHighlight($source_id, tab.id);
		console.log('scratches', $scratches);
	}
	let logged_in = true;
	setTimeout(() => {
		logged_in = !!session;
	}, 2000);
	onMount(async () => {
		try {
			chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
				if (request.action == 'update_curr_url') updateActive();
				if (request.action === 'uploadTextSB') {
					console.log('uplaodtextsb');
					const { action, ...rest } = request;
					rest.context = { html: rest.html, text: rest.html };
					rest.packed_context = String.fromCharCode(...Pako.deflate(JSON.stringify(rest.context)));

					const { note_data } = await trpc($page).upload_snippet.mutate(rest);
					if (note_data) {
						console.log(note_data.quote);
						note_sync.notestore.update((n) => {
							n[$source_id] = [...(n[$source_id] || []), { ...note_data, ...mock }];
							return n;
						});
					}
				}
			});
		} catch {
			console.log('dev?');
		}
		let { data } = await supabase.auth.getSession();
		if (!data.session) {
			console.log('getting session');
			let atokens = await trpc($page).my_email.query();
			atokens || window.open(API_ADDRESS); // TODO: doesnt work iirc
			session = (await getSession(supabase, atokens))!;
		} else {
			session = data.session;
		}
		console.log('session is', session);
		note_sync.user_id = session.user.id;
		logged_in = !!session;
		updateActive();
		sub(note_sync)(curr_title, curr_url);
	});
</script>

{$source_id}
{#if !logged_in}
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
	<div class=" text-xl text-center w-full italic">{curr_title}</div>
	<NotePanel {note_sync} source_id={$source_id} />

	<textarea
		placeholder="scratchy scratch scratch"
		class="w-full"
		bind:value={$scratches[curr_domain_title]}
	/>
	<!-- <button on:click={() => console.log(peccatoribus(2.5))}> pls</button> -->
</div>
