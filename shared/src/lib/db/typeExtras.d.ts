import type { Database } from "./types"
import type { SupabaseClient as _SupabaseClient } from "@supabase/supabase-js"
export type SupabaseClient = _SupabaseClient<Database>
import type { Notes } from "./types"
import type { Option } from "fp-ts/lib/Option"

export type SourceData = { sources: { title: string, domain: string } }
export type NoteEx = Note &
  SourceData & {
    searchArt: Option<{ selectedKeys: string[], optKR: Fuzzysort.KeysResult<NoteEx> }>
  }
type NoteFull = Notes & { serialized_highlight: string, snippet_uuid: string }
type NoteNoQuote = Notes & { serialized_highlight: null, snippet_uuid: null, quote: "" } // this type means if quote is nonempty snippet must've been taken..
export type Note = (NoteFull | NoteNoQuote) & { id: UUID, source_id: UUID }
// export type Note = Notes & { id: UUID, source_id: UUID }

export type Notess = NoteEx[]
