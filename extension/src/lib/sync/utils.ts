import { DEBUG } from "$lib/utils"
import { array as A } from "fp-ts"
import type { Patch } from "immer"


// export const getUpdatedNotes = async (supabase: SupabaseClient, user_id: string, lastDate: string) => {
//   const { data } = await supabase.from("notes").select("*").eq("user_id", user_id).gt("updated_at", lastDate)
//     .order("updated_at", { ascending: true }).limit(10000) // TODO: pagination
//     // I think the pagination should be handled here and not in the fetch new notes function.
//   return data || []
// }

import {
  applyPatchesMutatively as _applyPatches,
  convertPatchesToStandard,
  safeProduceWithPatches,
  type UnFreeze,
} from "structurajs"
import type { Writable } from "svelte/store"

// curry
export const applyPatches
  = (ps: Patch[]) =>
    <T>(s: T) => {
      _applyPatches(s, ps)
      DEBUG && console.log("applying patches")
      return s
    }

export const updateStore
  = <T>(store: Writable<T>) =>
    (up: (arg: UnFreeze<T>) => void | T) => {
      let [patches, inverse]: Patch[][] = [[], []]
      store.update((storeVal) => {
        const [result, ...pinv]
          = safeProduceWithPatches(storeVal, up)
          ;[patches, inverse] = A.map(convertPatchesToStandard)(pinv) as Patch[][]
        return result as T
      })
      DEBUG && console.log(patches)
      return { patches, inverse }
    }


// export const maxDate = (dateStrs: string[]) => pipe(
//   () => pipe(dateStrs, A.map(parseISO), max, x => x.toISOString()),
//   O.tryCatch,
//   O.getOrElse(() => ))
const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
export const maxDate = (dateStrs: string[]) => dateStrs.reduce((max, current) =>
  (isoRegex.test(current) && max.localeCompare(current) > 0) ? max : current, new Date(0).toISOString())
