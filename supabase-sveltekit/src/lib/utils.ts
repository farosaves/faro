import type { SupabaseClient as _SupabaseClient } from "@supabase/supabase-js"
import { Card } from "fsrs.js"
import type { Database, Notes } from "shared"
import { fillInTitleUrl, partition_by_id } from "shared"
import type { NoteSync, NoteEx } from "shared"
import { get } from "svelte/store"

// export type SupabaseClient = _SupabaseClient<Database>;

export type NoteFilter = (n: NoteEx & { priority: number }) => NoteEx & { priority: number }
