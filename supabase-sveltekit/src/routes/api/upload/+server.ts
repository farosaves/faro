import type { Snippets } from '$lib/dbtypes';
import type { SupabaseClient } from '$lib/first';
import { error, json } from '@sveltejs/kit';
export async function POST({ request, locals }) {
	const { selectedText, contextText, website_url, website_title } = await request.json();
	console.log('uploaded:', { selectedText, contextText });
	const supabase: SupabaseClient = locals.supabase  // here this loads defined tables properly
	let sess = await locals.getSession()
	console.log(sess?.user.email)
	const {error} = await supabase.from("snippets").insert({ snippet_text: contextText, origin_website: website_url, website_title })
	console.log(error)
	return json({});
}
