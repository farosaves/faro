interface SnippetData {
	created_at: string;
	id: number;
	origin_website: string | null;
	predicted_topic: string | null;
	snippet_text: string;
	user_id: string;
}
interface CardContentData {
    back: string;
    created_at: string;
    front: string;
    id: number;
    snippet_id: number | null;
}
import type { Database } from '$lib/dbtypes';
import type { SupabaseClient } from '@supabase/supabase-js';
export type SupabaseClient = SupabaseClient<Database>;
