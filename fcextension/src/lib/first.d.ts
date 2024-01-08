import type { Database, Row } from '$lib/dbtypes';
import type { SupabaseClient } from '@supabase/supabase-js';
export type SupabaseClient = SupabaseClient<Database>;
export type SnippetData = Row<'snippets'>;
export type CardContentData = Row<'card_contents'>;
export type CardData = Row<'cards'>;

