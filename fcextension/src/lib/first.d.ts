import type { Database } from '$lib/dbtypes';
import type { SupabaseClient } from '@supabase/supabase-js';
export type SupabaseClient = SupabaseClient<Database>;
