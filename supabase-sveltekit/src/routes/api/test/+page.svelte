<script>
	let n_deletions = 1;
	let res = 'placeholder';
	let website_title = 'Chick flick';
	let text =
		'Women are typically portrayed in chick flicks as sassy, noble victims, or klutzy twentysomethings. Romantic comedies (rom-coms) are often also chick flicks. However, rom-coms are typically respected more than chick flicks because they are designed to appeal to men and women.';

	async function callapi() {
		const response = await fetch('/api/make-flashcard', {
			method: 'POST',
			body: JSON.stringify({ n_deletions, text, website_title }),
			headers: {
				'content-type': 'application/json'
			}
		});

		res = (await response.json()).output.join('');
		console.log(res);
	}
</script>

<div class="col-6 form-widget">
	<input class="text-xl" bind:value={website_title} />
	<input bind:value={text} />
	<span class="text-center">{res}</span>
	<button on:click={callapi}>Replicate test</button>
</div>
