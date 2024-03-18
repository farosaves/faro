import type { SupabaseClient as _SupabaseClient } from "@supabase/supabase-js"
import type { Database, Notes, SourceData } from "shared"
import { fillInTitleUrl, hostname, partition_by_id } from "shared"
import type { NoteSync, NoteEx } from "shared"
import { option as O } from "fp-ts"

// export type SupabaseClient = _SupabaseClient<Database>;

export type NoteFilter = (n: NoteEx & { priority: number }) => NoteEx & { priority: number }

export const hostnameStr = (n: SourceData) => O.getOrElse(() => "")(hostname(n.sources.url))
