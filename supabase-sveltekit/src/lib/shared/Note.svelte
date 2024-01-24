<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { Notes } from '../dbtypes';

	export let note_data: Notes;
	export let showing_content: boolean;
	export let fun: MouseEventHandler<any>;
	export let deleteit: MouseEventHandler<any>;
	let replacer = (capture: string) => `<b class="text-yellow-200">` + capture + `</b>`;
	$: text = note_data.highlights
		? note_data.quote.replaceAll(note_data.highlights[0], replacer)
		: note_data.quote;
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" bind:checked={showing_content} on:click={fun} />
	<div class="collapse-content" style="grid-row-start: 2;">
		<button class="btn btn-xs w-full" style="color: red;" on:click={deleteit}>DELETE</button>
	</div>
	<div
		class="collapse-title text-center"
		style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1"
	>
		{@html text}
	</div>
	<!-- <div class="collapse-content" style="font-size: 0.95rem; padding: 0.5rem; grid-row-start:3">
		<button class="btn btn-xs w-full" style="color: red;" on:click={deleteit}>DELETE</button>
	</div> -->
</div>
