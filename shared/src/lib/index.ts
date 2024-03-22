// Reexport your entry components here
// import SvelteComp from './SvelteComp.svelte';
import _Note from "./_Note.svelte"
import Tags from "./Tags.svelte"
import MyTags from "./MyTags.svelte"
import StarArchive from "./StarArchive.svelte"
import { NoteSync } from "./sync/main"
export * from "./utils"
export * from "./db/types"
export * from "./shortcut"
export * from "./db/mock"
import { makeQCH } from "./snippetiser/main"
import * as dbtypes from "./db/types"
export * from "./stores"
import type { NoteEx, SupabaseClient, SourceData } from "./db/typeExtras"

export { NoteSync, Tags, MyTags, _Note, makeQCH, dbtypes, StarArchive }
export type { NoteEx, SupabaseClient, SourceData }

// import _Note from "./_Note.svelte"
