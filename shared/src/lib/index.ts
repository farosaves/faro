// Reexport your entry components here
// import SvelteComp from './SvelteComp.svelte';
import _Note from "./_Note.svelte"
import Tags from "./Tags.svelte"
import MyTags from "./MyTags.svelte"
import { NoteSync } from "./note-sync"
export * from "./utils"
export * from "./dbtypes"
import { makeQCH } from "./snippetiser/main"
import * as dbtypes from "./dbtypes"
import type { NoteEx, SupabaseClient } from "./first"

export {
  NoteSync,
  Tags,
  MyTags,
  _Note,
  makeQCH,
  dbtypes,
  type NoteEx,
  type SupabaseClient,
}

// import _Note from "./_Note.svelte"
