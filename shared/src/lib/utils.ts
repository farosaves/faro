import type { Notess, SupabaseClient } from "./db/typeExtras"
import { array as A, task as T } from "fp-ts"
import type { Option } from "fp-ts/lib/Option"
import { option as O, record as R, number as N } from "fp-ts"
import { flow, identity, pipe } from "fp-ts/lib/function"
import type { LazyArg } from "fp-ts/lib/function"
import { derived, get, writable, type Writable } from "svelte/store"
import { Subject, Observable } from "rxjs"
import type { Session } from "@supabase/supabase-js"
import type { Draft, Patch } from "immer"
// import { produceWithPatches as pWPimmer, enablePatches } from "immer"

import {
  convertPatchesToStandard,
  applyPatchesMutatively as _applyPatches,
  type UnFreeze,
  safeProduceWithPatches,
} from "structurajs"
import type { Notes } from "./db/types"
// setAutoFreeze(false)  only for perf reasons makes sense if tested.. 

export const getOrElse: <A>(onNone: LazyArg<NoInfer<A>>) => (ma: Option<A>) => A = O.getOrElse

export const mapSome = <U, T>(f: (...args: [U]) => O.Option<T>) => flow(A.map(f), A.flatMap(A.fromOption))

export const partition_by_id = (id: number) => A.partition((v: { id: number }) => v.id == id)
export const delete_by_id = (id: number) => A.filter((v: { id: number }) => v.id !== id)

export function desc<T>(first: (t: T) => number, second: (t: T) => number = (t) => 0): (t1: T, t2: T) => number {
  return (t1, t2) => first(t2) - first(t1) || second(t2) - second(t1)
}
export const asc
  = <T>(f: (t: T) => number) =>
    (t1: T, t2: T) =>
      f(t1) - f(t2)

export const ifErr
  = (f: (e: any) => void, is = true) =>
    <T extends { error: any }>(r: T) => {
      const { error } = r
      if (!!error == is) f(error)
      return r
    }
export const ifNErr = (f: (e: any) => void) => ifErr(f, false)
export const logIfError = ifErr(console.log)

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
export const hostname = (s: string) => O.tryCatch(() => s && new URL(s).hostname)

export const domain_title = (url: string, title: string) => O.map(s => [s, title].join(";"))(hostname(url))

// sort descendingly but for negative scores filter out
export const filterSort
  = <T>(first: (x: T) => number, second = first) =>
    (xs: T[]) =>
      xs.filter(x => first(x) > 0).toSorted(desc(first, second))

type T = {
  title: string | null
  url: string | null
} | null
export const fillInTitleUrl = (v: T) => {
  const _get = (u: typeof v, fld: "title" | "url", missing: string) =>
    pipe(
      u,
      O.fromNullable,
      O.chain(v => O.fromNullable(v[fld])),
      O.fold(() => missing, identity),
    )
  return { title: escapeHTML(_get(v, "title", "missing Title")), url: _get(v, "url", "") }
}

// https://github.com/extend-chrome/messages?tab=readme-ov-file#rxjs-observables
export const toStore = <T>(Sub: Observable<T>, init: T) => {
  const store = writable(init)
  Sub.subscribe(store.set)
  return store
}

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

export async function getNotes(
  supabase: SupabaseClient,
  source_id: Option<string>,
  user_id: string,
  prevnotes = [],
): Promise<Notes[]> {
  console.log("getting notes")
  let query = supabase.from("notes").select("*").eq("user_id", user_id)
  query = O.match(
    () => query,
    (id: string) => query.eq("source_id", id),
  )(source_id)

  const { data } = await query
  console.log("got notes")

  if (data === null) return prevnotes
  return data
}

export const curry2 = <A, B, C>(f: (a: A, b: B) => C) => (a: A) => (b: B) => f(a, b)
export const eq = <T>(a: T) => (b: T) => a == b
export const neq = <T>(a: T) => (b: T) => a != b

export const escapeHTML = (text: string) => {
  const div = document.createElement("div")
  div.innerText = text
  return div.innerHTML
}

export const unwrapTo
  = <T>(x: Option<T>) =>
    (y: T) =>
      O.getOrElse(() => y)(x)

// curry
export const applyPatches
  = (ps: Patch[]) =>
    <T>(s: T) => {
      _applyPatches(s, ps)
      console.log("applying patches")
      return s
    }

export const updateStore
  = <T>(store: Writable<T>) =>
    // (up: (arg: Draft<T>) => void | Draft<T>) => {
    (up: (arg: UnFreeze<T>) => void | T) => {
      let [patches, inverse]: Patch[][] = [[], []]
      store.update((storeVal) => {
        // ;[result, patches, inverse] = pWPimmer(storeVal, up)  // immer doesnt fix here
        const [result, ...pinv]
          = safeProduceWithPatches(storeVal, up)
          ;[patches, inverse] = A.map(convertPatchesToStandard)(pinv) as Patch[][]
        return result as T
      })
      console.log(patches)
      return { patches, inverse }
    }
