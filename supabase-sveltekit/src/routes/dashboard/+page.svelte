<script lang="ts">
	import { onMount } from 'svelte';
	import type { Notes } from '$lib/dbtypes.js';
	import { Note } from '$root/../shared/Note.svelte';
	export let data;
	$: ({ session, supabase } = data);
	let notes: Notes[] = [];
	onMount(async () => {
		const { data } = await supabase.from('notes').select().eq('user_id', session?.user.id!);
		notes = data || notes;
	});
</script>

{#each notes as note}
	{note.quote}
{/each}
