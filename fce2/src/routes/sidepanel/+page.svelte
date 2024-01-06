<script>
	export let data;
	import { onMount } from 'svelte';
	import { getSession } from '$lib/utils.js';
	import Snippet from '$lib/Snippet.svelte';
	// import type { Database } from "$lib/supabase.js";
	let { supabase } = data;
	let session;
	async function getSnippets() {
		supabase;
		return;
	}
	onMount(async () => {
		session = await getSession(supabase);
		console.log(session.user.email);
	});
	$: email = session ? session.user.email : 'none@none';

	const DOMAIN = 'http://localhost:5173';

	let showing_contents = [false, false];
	let fun = () => {
		showing_contents = showing_contents.map((_) => false);
	};

	let website_title = 'Chick flick';
	let link = 'https://en.wikipedia.org/wiki/Chick_flick';
	let text =
		'Women are typically portrayed in chick flicks as sassy, noble victims, or klutzy twentysomethings. Romantic comedies (rom-coms) are often also chick flicks. However, rom-coms are typically respected more than chick flicks because they are designed to appeal to men and women.';

	async function process_snippet() {
		let n_cards = text.split('.').length;
		const response = await fetch(`${DOMAIN}/api/make-flashcard`, {
			method: 'POST',
			body: JSON.stringify({ n_cards, text, website_title, link, session }),
			headers: {
				'content-type': 'application/json'
			}
		});
		let ret = await response.json();
		console.log(ret);
		qas = ret.qas;
		snippet_id = ret.snippet_id;
		card_ids = ret.card_ids;
		qas_accepted = card_ids.map((x) => false);
		qas_rejected = card_ids.map((x) => false);
		console.log(qas);
	}
	const handleInserts = (payload) => {
		console.log('Change received!', payload);
	};

	supabase
		.channel('snippets')
		.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todos' }, handleInserts)
		.subscribe();
</script>

{email}<br />
<div class="max-w-xs mx-auto space-y-4">
	<Snippet {text} bind:showing_content={showing_contents[0]} {fun} />
	<Snippet {text} bind:showing_content={showing_contents[1]} {fun} />
	<span class="block p-4 my-2 bg-green-500 text-white hover:bg-green-600 rounded-md"
		>Clickable Text 2</span
	>
	<span class="block p-4 my-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-md"
		>Clickable Text 3</span
	>
	<div class="h-8"></div>

	<div class=" form-widget">
		<input class="text-xl" bind:value={website_title} />
		<input class="resize-y" bind:value={text} />
		<button on:click={process_snippet}>Replicate test</button>
		<button class="btn-primary btn">Replicate test</button>
	</div>
</div>
