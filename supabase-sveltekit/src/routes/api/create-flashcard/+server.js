export async function POST({ locals, request }) {
	const session = await locals.getSession();

	if (!session || !session.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	const data = await request.json();
	const text = data.text;

	console.log({ text });

	if (!text) {
		return new Response(JSON.stringify({ error: 'No text provided' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	// logic to convert the text into a flashcard goes here

	return new Response(JSON.stringify({ success: 'Flashcard created successfully' }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
