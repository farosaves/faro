import { error, json } from '@sveltejs/kit';
export async function POST({ request, locals }) {
	let sess = await locals.getSession();
	let email = sess?.user.email;
	console.log(email);
	return json({ email });
}
