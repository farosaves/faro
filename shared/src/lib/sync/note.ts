import type { UUID } from "crypto"
import type { Option } from "fp-ts/lib/Option"
import { option as O } from "fp-ts"

export type Note = {
  id: UUID
  domain: string
  title: string
  tags: string[]
  created_at: string
  updated_at: string
  quote: string
  url: string
  source_id: UUID
  prioritised: number
  // context: string | null
  // highlights: string[]
  // id: string
  // predicted_topic: string | null
  // referer: string | null
  // serialized_highlight: string | null
  // snippet_uuid: string | null
  // user_id: string
  // user_note: string | null
}
export type SourceData = { sources: { title: string, domain: string } }

// importante: all dashboard components expect this type
export type NoteEx = Note &
  SourceData & {
    searchArt: Option<{ selectedKeys: string[], optKR: Fuzzysort.KeysResult<NoteEx> }>
  }

export const note2NoteEx = (n: Note): NoteEx => ({ ...n, sources: { domain: n.domain, title: n.title }, searchArt: O.none })
