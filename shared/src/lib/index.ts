// Reexport your entry components here
// import SvelteComp from './SvelteComp.svelte';
import _Note from "./_Note.svelte"
import Tags from "./Tags.svelte"
import MyTags from "./MyTags.svelte"
import StarArchive from "./StarArchive.svelte"
import Dashboard from "./dashboard/Dashboard.svelte"
export * from "./sync/sync"
export * from "./sync/deri"
export * from "./utils"
export * from "./db/types"
export * from "./shortcut"
export * from "./db/mock"
import { makeQCH } from "./snippetiser/main"
import { persisted } from "./sync/persisted-store"
import * as dbtypes from "./db/types"
import * as schemas from "./db/schemas"
export * from "./stores"
import type { NoteEx, SupabaseClient, SourceData } from "./db/typeExtras"
import type { UUID } from "crypto"

export const nsUuid: UUID = "0646f4ce-17c9-4a66-963e-280982b6ac8a"
export { Tags, MyTags, _Note, makeQCH, dbtypes, schemas, persisted, StarArchive, Dashboard }
// export { Dashboard }
export type { NoteEx, SupabaseClient, SourceData }

// import _Note from "./_Note.svelte"
