import type { Database } from "$lib/dbtypes"
import type { SupabaseClient } from "@supabase/supabase-js"
export type SupabaseClient = SupabaseClient<Database>
import type { Notes } from "$lib/dbtypes"
import type { Option } from "fp-ts/lib/Option"
import * as FuzzySort from "fuzzysort"
export type NoteEx = Notes & { sources: { title: string; url: string } } & {
  searchArt: Option<{ selectedKey: string; optKR: Fuzzysort.KeyResult<Notes> }>
}
export type Notess = NoteEx[]
