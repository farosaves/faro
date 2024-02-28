import { Card } from "fsrs.js";
import type { Notes } from "./dbtypes";
import { fillInTitleUrl, partition_by_id } from "./shared/utils";
import type { NoteSync } from "./shared/note-sync";
import { get } from "svelte/store";
import type { NoteEx } from "./shared/first";

export function ts(card: Card) {
  return {
    ...card,
    due: card.due.toUTCString(),
    last_review: card.last_review.toUTCString(),
  };
}

export type NoteFilter = (
  n: NoteEx & { priority: number },
) => NoteEx & { priority: number };

export const handlePayload =
  (note_sync: NoteSync) => async (payload: { new: Notes | object }) => {
    if ("id" in payload.new) {
      const nn = payload.new;
      const id = nn.source_id;
      const n = get(note_sync.notestore);
      const sources = n[id]
        ? n[id][0].sources
        : fillInTitleUrl({
            sources: (
              await note_sync.sb
                .from("sources")
                .select("title, url")
                .eq("id", id)
                .maybeSingle()
            ).data,
          });
      note_sync.notestore.update((n) => {
        n[id] = n[id] || []; // ensure filter possible
        // left is filtered so NOT matching id
        let parts = partition_by_id(nn.id)(n[id]);
        n[id] = [...parts.left, { ...nn, sources }];
        return n;
      });
    } else note_sync.update_all_pages();
  };
