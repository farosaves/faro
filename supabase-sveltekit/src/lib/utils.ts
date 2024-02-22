import { Card } from "fsrs.js";
import type { Notes } from "./dbtypes";
import { partition_by_id } from "./shared/utils";
import type { NoteSync } from "./shared/note-sync";

export function ts(card: Card) {
  return {
    ...card,
    due: card.due.toUTCString(),
    last_review: card.last_review.toUTCString(),
  };
}

export const handlePayload = (note_sync: NoteSync) => (payload: {new: Notes | object}) => {
  if ("id" in payload.new) {
    const nn = payload.new;
    note_sync.notestore.update((n) => {
      let id = nn.source_id;
      n[id] = n[id] || []; // ensure filter possible
      // left is filtered ie NOT matching id
      let parts = partition_by_id(nn.id)(n[id]);
      n[id] = [...parts.left, { ...nn, sources: n[id][0].sources }];
      return n;
    });
  } else note_sync.update_all_pages();
};
