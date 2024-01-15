<script lang="ts">
	const DOMAIN = 'http://localhost:5173';
	import type { MouseEventHandler } from 'svelte/elements';
	import type { Notes } from './dbtypes';

	export let note_data: Notes;
	export let showing_content: boolean;
	export let fun: MouseEventHandler<any>;
	export let deleteit: MouseEventHandler<any>;
	let replacer = (capture: string) => `<b class="text-yellow-400">` + capture + `</b>`;
	$: text = note_data.highlights
		? note_data.quote.replaceAll(note_data.highlights[0], replacer)
		: note_data.quote;
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" bind:checked={showing_content} on:click={fun} />
	<div class="collapse-title text-center" style="font-size: 0.95rem; padding: 0.5rem">
		{@html text}
	</div>
	<div class="collapse-content flex content-center">
		<button class="btn btn-xs w-full" style="color: red;" on:click={deleteit}>DELETE</button>
	</div>
</div>
