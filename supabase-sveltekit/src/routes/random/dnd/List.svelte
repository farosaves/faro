<script>
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	const flipDurationMs = 200;

	export let items = [];
	export let type;

	function handleSort(e) {
		items = e.detail.items;
	}
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" />
	<div class="collapse-title text-xl font-medium">Click me to show/hide content</div>
	<div class="collapse-content">
		<section
			use:dndzone={{ items, flipDurationMs, type }}
			on:consider={handleSort}
			on:finalize={handleSort}
		>
			{#each items as item (item.id)}
				<div
					class="btn"
					style={type === 'dark' ? 'background-color:rgba(0,0,0,0.7); color: white' : ''}
					animate:flip={{ duration: flipDurationMs }}
				>
					<input bind:value={item.title} />
				</div>
			{/each}
		</section>
	</div>
</div>

<!-- </div>
</div> -->

<style>
	/* div {
		height: 1.5em;
		width: 10em;
		text-align: center;
		border: 1px solid black;
		margin: 0.2em;
		padding: 0.3em;
	} */
	section {
		min-height: 1rem;
	}
</style>
