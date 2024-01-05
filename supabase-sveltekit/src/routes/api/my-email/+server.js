import { error, json } from '@sveltejs/kit';
export async function POST({ request, locals }) {
	let email = sess?.user.email;
	console.log(email);
	return json({ email });
}
