import type { SupabaseClient } from "$lib/db/typeExtras"
import { DEBUG } from "$lib/utils"
import { array as A, option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Patch } from "immer"
import { parseISO, max } from "date-fns"


export const getUpdatedNotes = async (supabase: SupabaseClient, user_id: string, lastDate: string) => {
  const { data } = await supabase.from("notes").select("*").eq("user_id", user_id).gt("updated_at", lastDate)
    .order("updated_at", { ascending: true }).limit(1000)
  return data || []
}

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

type _T = {
  title: string | null
  domain: string | null
} | undefined
export const fillInTitleDomain = (v: _T) => ({ title: v?.title || "missing Title", domain: v?.domain || "" })

export const maxDate = (dateStrs: string[]) => pipe(
  () => pipe(dateStrs, A.map(parseISO), max, x => x.toISOString()),
  O.tryCatch,
  O.getOrElse(() => new Date(0).toISOString()))

