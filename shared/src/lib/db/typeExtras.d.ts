import type { Database } from "./types"
import type { SupabaseClient as _SupabaseClient } from "@supabase/supabase-js"
export type SupabaseClient = _SupabaseClient<Database>
import type { Notes } from "./types"
import type { Option } from "fp-ts/lib/Option"
export type SourceData = { sources: { title: string; domain: string } }
export type NoteEx = Notes &
  SourceData & {
    searchArt: Option<{ selectedKeys: string[]; optKR: Fuzzysort.KeysResult<NoteEx> }>
  }

export type Note = Omit<Notes, "id" | "source_id"> & { id: UUID; source_id: UUID }
export type Notess = NoteEx[]
