<script lang="ts">
	import type { Session } from '@supabase/gotrue-js';
	export let data;
	import { onMount } from 'svelte';
	import { getSession, zip } from '$lib/utils';
	import Snippet from '$lib/Snippet.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { SnippetData } from '$lib/first.js';
	let { supabase } = data;
	let session: Session;
	$: ss = { supabase, session };
	async function getSnippets() {
		const { data, error } = await supabase.from('snippets').select().eq('user_id', session.user.id);
		error && console.log('getSnippets error', error);
		return data ?? [];
	}
	let snippets: SnippetData[] = [];

	const onSnippetInsert = (payload: { new: SnippetData }) => {
		console.log(payload.new);
		snippets = [...snippets, payload.new];
		showing_contents = [...showing_contents, false];
	};

	onMount(async () => {
		session = (await getSession(supabase)) || redirect(300, DOMAIN); // omg I'm starting to love typescript
		snippets = await getSnippets();
		supabase
			.channel('snippets')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'snippets',
					filter: `user_id=eq.${session.user.id}`
				},
				onSnippetInsert
			)
			.subscribe();
	});
	$: email = session ? session.user.email : 'none@none';

	const DOMAIN = 'http://localhost:5173';

	let showing_contents = snippets.map((_) => false);
	let fun = () => {
		showing_contents = showing_contents.map((_) => false);
	};

	let website_title = 'Chick flick';
	let link = 'https://en.wikipedia.org/wiki/Chick_flick';

	// async function callapi() {
	// 	const response = await fetch(`${DOMAIN}/api/make-flashcard`, {
	// 		method: 'POST',
	// 		body: JSON.stringify({ n_cards, text, website_title, link, session }),
	// 		headers: { 'content-type': 'application/json' }
	// 	});
	// 	let ret = await response.json();
	// 	qas = ret.qas;
	// 	snippet_id = ret.snippet_id;
	// 	card_ids = ret.card_ids;
	// 	qas_accepted = card_ids.map((x) => false);
	// 	qas_rejected = card_ids.map((x) => false);
	// 	console.log(qas);
	// }

	let text =
		'Women are typically portrayed in chick flicks as sassy, noble victims, or klutzy twentysomethings. Romantic comedies (rom-coms) are often also chick flicks. However, rom-coms are typically respected more than chick flicks because they are designed to appeal to men and women.';
</script>

{email}<br />
<!-- {snippets.map((v) => v.created_at.toString()).join('\n')} -->
<div class="max-w-xs mx-auto space-y-4">
	<!-- <Snippet {data} {text} bind:showing_content={showing_contents[1]} {fun} /> -->
	{#each snippets as snippet_data, i}
		{i}
		<Snippet {ss} {snippet_data} bind:showing_content={showing_contents[i]} {fun} />
	{/each}

	<div class=" form-widget">
		<input class="text-xl" bind:value={website_title} />
		<input class="resize-y" bind:value={text} />
		<!-- <button on:click={process_snippet}>Replicate test</button> -->
		<button class="btn-primary btn" on:click={async () => console.log(await getSnippets())}
			>Get snippets</button
		>
	</div>
</div>
