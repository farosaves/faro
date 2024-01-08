import { error, json } from '@sveltejs/kit';
export async function POST({ request, locals }) {
	const { selectedText, contextText } = await request.json();
	console.log('uploaded:', { selectedText, contextText });
	return json({});
}
