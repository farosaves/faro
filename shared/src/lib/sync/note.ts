import type { UUID } from "crypto"

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
