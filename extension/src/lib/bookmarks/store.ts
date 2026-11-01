// BookmarkStore: the seam where browser bookmarks (the v2.0 master copy) plug into NoteSync.
// This file only holds the interface and a no-op stub so the extension builds and loads with
// an empty dashboard. WS-C replaces `stubBookmarkStore` with the real implementation
// (see docs/v2.0-implementation-plan.md, WS-C).
import type { Note, PendingNote } from "$lib/sync/note"

/** What a new note is created from: the content script's pending note plus page title and tags. */
export type NewNoteInput = PendingNote & Pick<Note, "title" | "tags">

export interface BookmarkStore {
  /** Read every bookmark and return the notes they decode to. */
  load: () => Promise<Note[]>
  /** Create (or adopt) the bookmark for a new note; returns the note, or undefined if nothing was saved. */
  newNote: (input: NewNoteInput) => Promise<Note | undefined>
  /** Write a changed note (title, tags, prioritised, url) back to its bookmark. */
  update: (note: Note) => Promise<void>
  /** Remove the bookmark behind a note. */
  delete: (noteId: string) => Promise<void>
}

export const stubBookmarkStore: BookmarkStore = {
  load: async () => [],
  newNote: async () => undefined,
  update: async () => {},
  delete: async () => {},
}
