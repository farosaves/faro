export async function GET({ locals }) {
	const session = await locals.getSession();

	if (!session || !session.user) {
		return new Response(JSON.stringify({ isLoggedIn: false }), {
			status: 200, // Keep status as 200 but indicate logged out
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	return new Response(JSON.stringify({ isLoggedIn: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
