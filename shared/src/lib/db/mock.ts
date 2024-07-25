import type { Notes } from "./types"

export type PendingNote = Omit<Notes, keyof ReturnType<typeof createMock>>

// let currentId = 0
export const createMock = () => ({
  id: crypto.randomUUID(),
  source_id: "",
  predicted_topic: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: [],
  user_id: "",
  user_note: "",
  context: "",
  prioritised: 0,
  referer: null,
})
