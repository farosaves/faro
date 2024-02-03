import type { Database } from '$lib/dbtypes';
import type { SupabaseClient } from '@supabase/supabase-js';
export type SupabaseClient = SupabaseClient<Database>;
import type { Notes } from '$lib/dbtypes';
export type Notess = (Notes & { sources: { title: string } })[]