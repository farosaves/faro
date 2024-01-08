import type { Snippets } from '$lib/dbtypes';
import type { SupabaseClient } from '$lib/first';
import { error, json } from '@sveltejs/kit';
export async function POST({ request, locals }) {
	const { selectedText, contextText, origin_website, website_title } = await request.json();
	console.log('uploaded:', { selectedText, contextText });
	const supabase: SupabaseClient = locals.supabase  // here this loads defined tables properly
	let sess = await locals.getSession()
	console.log(sess?.user.email)
	supabase.from("snippets").insert({ snippet_text: contextText, origin_website, website_title })
	return json({});
}
