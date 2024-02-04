<script lang="ts">
	export let search = {
		query: '',
		byTags: false,
		byTitles: false,
		byText: false
	};
</script>

<form>
	<input
		type="text"
		placeholder="Type here"
		class="input w-full max-w-xs"
		bind:value={search.query}
	/>
	<button hidden on:click={() => console.log(search)}></button>
</form>
<div class="join">
	<label class="label cursor-pointer join-item">
		<span class="label-text">Tags</span>
		<input type="checkbox" bind:checked={search.byTags} class="checkbox" />
	</label>
	<label class="label cursor-pointer join-item">
		<span class="label-text">Titles</span>
		<input type="checkbox" bind:checked={search.byTitles} class="checkbox" />
	</label>
	<label class="label cursor-pointer join-item">
		<span class="label-text">Text</span>
		<input type="checkbox" bind:checked={search.byText} class="checkbox" />
	</label>
</div>
