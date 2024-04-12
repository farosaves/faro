import type { NoteEx } from "shared"

// export type SupabaseClient = _SupabaseClient<Database>;

export type NoteFilter = (n: NoteEx & { priority: number }) => NoteEx & { priority: number }

