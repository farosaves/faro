// Reexport your entry components here
// import SvelteComp from './SvelteComp.svelte';
import _Note from "./_Note.svelte"
import Tags from "./Tags.svelte"
import MyTags from "./MyTags.svelte"
import StarArchive from "./StarArchive.svelte"
export * from "./sync/sync"
export * from "./utils"
export * from "./db/types"
export * from "./shortcut"
export * from "./db/mock"
import { makeQCH } from "./snippetiser/main"
import * as dbtypes from "./db/types"
import * as schemas from "./db/schemas"
export * from "./stores"
import type { NoteEx, SupabaseClient, SourceData } from "./db/typeExtras"

export { Tags, MyTags, _Note, makeQCH, dbtypes, schemas, StarArchive }
export type { NoteEx, SupabaseClient, SourceData }

// import _Note from "./_Note.svelte"
