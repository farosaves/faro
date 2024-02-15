import type { Notes } from "./dbtypes";
import type { NoteSync } from "$lib/shared/note-sync";

export let sub = (note_sync: NoteSync) => {	
    console.log(note_sync.user_id)
    // let _sub = (event: "INSERT" | "UPDATE"| "DELETE") => 3
	note_sync.sb
		.channel('notes')
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'notes',
				filter: `user_id=eq.${note_sync.user_id}`
			}, // at least url should be the same so no need to filter
			(payload: { new: Notes }) => {
                console.log(payload)
                note_sync.update_all_pages()
			}
		)
		.subscribe();
};
