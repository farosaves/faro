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

	/**
	 * @param {string} model
	 * @param {string} inputText
	 */
	async function sendGPTRequest(model, inputText) {
		try {
			const response = await fetch('/api/llm-form-submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: inputText, model })
			});

			if (response.ok) {
				const result = await response.json();
				return JSON.parse(result.body.completion);
			} else {
				console.error(`Failed to get ${model} response:`, await response.json());
			}
		} catch (error) {
			console.error('Error during fetch:', error);
		}
	}

	async function sendData() {
		isLoading = true;

		sendGPTRequest('gpt-3.5-turbo-1106', inputText).then((completion) => {
			gpt3Response = completion;
			isLoading = isLoading && !gpt4Response;
		});

		sendGPTRequest('gpt-4-1106-preview', inputText).then((completion) => {
			gpt4Response = completion;
			isLoading = isLoading && !gpt3Response;
		});
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
