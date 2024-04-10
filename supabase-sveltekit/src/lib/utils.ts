import type { SourceData } from "shared"
import { hostname } from "shared"
import type { NoteEx } from "shared"
import { option as O } from "fp-ts"

// export type SupabaseClient = _SupabaseClient<Database>;

export type NoteFilter = (n: NoteEx & { priority: number }) => NoteEx & { priority: number }

export const hostnameStr = (n: SourceData) => O.getOrElse(() => "")(hostname(n.sources.url))
