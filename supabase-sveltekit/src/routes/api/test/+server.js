export async function GET({ locals }) {
	const session = await locals.getSession();

	if (!session || !session.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	// Your protected API logic here
	return new Response(JSON.stringify({ data: `You're logged in` }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
