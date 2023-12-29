<script>
	let n_deletions = 1;
	let res = 'placeholder';
	let prompt = 'If I have one cookie and one pastry, how many food items do I have?';

	async function callapi() {
		const response = await fetch('/api/make-flashcard', {
			method: 'POST',
			body: JSON.stringify({ n_deletions, prompt }),
			headers: {
				'content-type': 'application/json'
			}
		});

		res = (await response.json()).output.join('');
		console.log(res);
	}
</script>

<div class="col-6 form-widget">
	<input bind:value={prompt} />
	<span class="text-center">{res}</span>
	<button on:click={callapi}>Replicate test</button>
</div>
