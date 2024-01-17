import { error, json } from '@sveltejs/kit';
export async function POST({ request, locals }) {
	let sess = await locals.getSession();
	if (sess) {
		const { user, access_token, refresh_token } = sess;
		let email = user.email;
		return json({ email, access_token, refresh_token });
	}
	return json({});
}
