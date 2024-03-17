import type { Notes } from "./types"

export type PendingNote = Omit<Notes, keyof ReturnType<typeof createMock>>

let currentId = 0
export const createMock = () => ({
  id: (currentId -= 1),
  source_id: -1,
  predicted_topic: "",
  created_at: "",
  tags: [],
  user_id: "",
  user_note: "",
  context_html: "",
})
