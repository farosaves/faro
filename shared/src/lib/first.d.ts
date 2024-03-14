import type { Database } from "$lib/dbtypes"
import type { SupabaseClient as _SupabaseClient } from "@supabase/supabase-js"
export type SupabaseClient = _SupabaseClient<Database>
import type { Notes } from "$lib/dbtypes"
import type { Option } from "fp-ts/lib/Option"
import FuzzySort from "fuzzysort"
export type NoteEx = Notes & { sources: { title: string; url: string } } & {
  searchArt: Option<{ selectedKey: string[]; optKR: Fuzzysort.KeysResult<NoteEx> }>
}
export type Notess = NoteEx[]
