<script>
	import LLMCard from './LLMCard.svelte';

	let isLoading = false;

	let inputText = '';
	/**
	 * @type {{ Question: string; Answer: string; } | null}
	 */
	let gpt3Response = null;
	/**
	 * @type {{ Question: string; Answer: string; } | null}
	 */
	let gpt4Response = null;

	async function sendData() {
		isLoading = true;
		const response = await fetch('/api/llm-form-submit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: inputText })
		});

		if (response.ok) {
			const result = await response.json();
			console.log(result);
			gpt3Response = JSON.parse(result.body.gpt3Response);
			gpt4Response = JSON.parse(result.body.gpt4Response);
			isLoading = false;
		} else {
			console.error('Failed to submit:', await response.json());
		}
	}
</script>

<svelte:head>
	<title>LLM Comparison</title>
</svelte:head>

<main>
	<h1 class="text-2xl">LLM Comparison</h1>

	<div class="input-container my-4">
		<label for="inputBox" class="input-label">Input Text: </label>
		<input
			type="text"
			placeholder="Type here"
			class="input input-bordered w-full max-w-xs"
			bind:value={inputText}
		/>
		<button on:click={sendData} class="btn btn-primary">Submit</button>
	</div>
	{#if isLoading}
		<span class="loading loading-spinner loading-lg"></span>
	{/if}
	{#if gpt3Response}
		<LLMCard llm="GPT-3.5" topText={gpt3Response.Question} bottomText={gpt3Response.Answer} />
	{/if}

	{#if gpt4Response}
		<LLMCard llm="GPT-4" topText={gpt4Response.Question} bottomText={gpt4Response.Answer} />
	{/if}
</main>

<style>
	main {
		padding: 20px; /* Adjust as needed for margin */
	}

	.input-container {
		display: flex; /* Aligns items in a row */
		align-items: center; /* Center items vertically */
		gap: 10px; /* Spacing between label and input */
	}
</style>
