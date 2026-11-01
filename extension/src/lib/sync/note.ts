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
  /** True once the bookmark lives under `Faro/` (adopted); plain bookmarks elsewhere are false. */
  underFaro: boolean
  /**
   * Read-only tags from the folder path(s) of a plain bookmark and its same-URL duplicates (decision 5.1c).
   * Never written to the bookmark; on adoption they become real tags. Always `[]` once `underFaro`.
   */
  derivedTags: string[]
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
export type Src = SourceData["sources"]

/** What the content script sends when the user saves a selection: url carries the `#:~:text=` fragment. */
export type PendingNote = Pick<Note, "quote" | "url">

/** Every tag a note can be filtered and searched by: its own tags, then the read-only folder tags of a plain bookmark. */
export const filterTags = (n: Pick<Note, "tags" | "derivedTags">) => [...n.tags, ...(n.derivedTags ?? [])]

// importante: all dashboard components expect this type
export type NoteEx = Note &
  SourceData & {
    /** All tags (incl. derived folder tags) as one string, for search. */
    tagsText: string
    searchArt: Option<{ selectedKeys: string[], optKR: Fuzzysort.KeysResult<NoteEx> }>
  }

export const note2NoteEx = (n: Note): NoteEx => ({
  ...n,
  sources: { domain: n.domain, title: n.title },
  tagsText: filterTags(n).join(" "),
  searchArt: O.none,
})
