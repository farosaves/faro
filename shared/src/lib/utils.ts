import type { Notess, SupabaseClient } from "./db/typeExtras"
import { array as A, task as T } from "fp-ts"
import type { Option } from "fp-ts/lib/Option"
import { option as O, record as R, number as N } from "fp-ts"
import { flow, identity, pipe } from "fp-ts/lib/function"
import { derived, get, writable, type Writable } from "svelte/store"
import { Subject, Observable } from "rxjs"
import type { Session } from "@supabase/supabase-js"
import {
  type Patch,
  convertPatchesToStandard,
  applyPatchesMutatively as _applyPatches,
  type UnFreeze,
  safeProduceWithPatches,
} from "structurajs"
import type { Notes } from "./db/types"
// setAutoFreeze(false)  only for perf reasons makes sense if tested..

const _sess: O.Option<Session> = O.none
export const sessStore = writable(_sess)
type ColorScheme = "light" | "dark"
const colorScheme: ColorScheme = "dark"
export const themeStore = writable<ColorScheme>(colorScheme)
export const replacer = derived(
  themeStore,
  (t) => (capture: string) => `<b class="${t == "dark" ? "text-yellow-100" : ""}">` + capture + `</b>`,
)
export const updateTheme = () =>
  themeStore.set(
    window.getComputedStyle(document.documentElement).getPropertyValue("color-scheme") as ColorScheme,
  )

export const safeGet =
  <T extends string | number | symbol, U>(record: {
    [id in T]: U[]
  }) =>
  (idx: T) =>
    idx in record ? record[idx] : ([] as U[])

// export const unwrap_def = <T>(o: Option<T>, def: T) =>
//   pipe(
//     o,
//     O.match(() => def, identity),
//   )

export const mapSome = <U, T>(f: (...args: [U]) => O.Option<T>) => flow(A.map(f), A.flatMap(A.fromOption))

export const partition_by_id = (id: number) => A.partition((v: { id: number }) => v.id == id)
export const delete_by_id = (id: number) => A.filter((v: { id: number }) => v.id !== id)

export function desc<T>(f: (t: T) => number): (t1: T, t2: T) => number {
  return (t1, t2) => f(t2) - f(t1)
}
export const asc =
  <T>(f: (t: T) => number) =>
  (t1: T, t2: T) =>
    f(t1) - f(t2)

export const ifErr =
  (f: (e: any) => void, is = true) =>
  <T extends { error: any }>(r: T) => {
    const { error } = r
    if (!!error == is) f(error)
    return r
  }
export const ifNError = (f: (e: any) => void) => ifErr(f, false)
export const logIfError = ifErr(console.log)

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
export const hostname = (s: string) => O.tryCatch(() => s && new URL(s).hostname)

export const domain_title = (url: string, title: string) => O.map((s) => [s, title].join(";"))(hostname(url))

// sort descendingly but for negative scores filter out
export const filterSort =
  <T>(f: (x: T) => number) =>
  (xs: T[]) =>
    xs.filter((x) => f(x) > 0).toSorted(desc(f))

type T = {
  title: string | null
  url: string | null
} | null
export const fillInTitleUrl = (v: T) => {
  const _get = (u: typeof v, fld: "title" | "url", missing: string) =>
    pipe(
      u,
      O.fromNullable,
      O.chain((v) => O.fromNullable(v[fld])),
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

// type Idx<T> = Array<T> | Record<string | number | symbol, T>
// export function idx(a: Array<T>, i: number): O.Option<T>
// export function idx<A extends string | number | symbol>(a: Record<A, T>, i: A): O.Option<T>
// export function idx(a: Idx<T>, i: any): O.Option<T> {
//   return O.fromNullable(a[i])
// }
// export function idx<S extends string | number | symbol, T>(a: Record<S, T>, i: S): O.Option<T>
// export function idx<T>(a: Array<T>, i: number): O.Option<T>

// const x = [{ a: "hello" }]
// const y: ReadonlyArray<{ a: string }> = [{ a: "hello" }]
// const z: Record<string, number> = { hey: 3 }
// I want these 3 to not give type error

// export function idx<T>(a: { [key: number]: T }, i: number): O.Option<T>
// export function idx<T>(a: { [key: symbol]: T }, i: symbol): O.Option<T>
// export function idx<T>(a: Idx<T>, i: string | number | symbol): O.Option<T> {

// }

export const escapeHTML = (text: string) => {
  var div = document.createElement("div")
  div.innerText = text
  return div.innerHTML
}

export const unwrapTo =
  <T>(x: Option<T>) =>
  (y: T) =>
    O.getOrElse(() => y)(x)

// curry
export const applyPatches =
  (ps: Patch[]) =>
  <T>(s: T) => {
    _applyPatches(s, ps)
    console.log("applying patches")
    return s
  }

export const updateStore =
  <T>(store: Writable<T>) =>
  // (up: (arg: Draft<T>) => void | Draft<T>) => {
  (up: (arg: UnFreeze<T>) => void | T) => {
    let [patches, inverse]: Patch[][] = [[], []]
    store.update((storeVal) => {
      const [result, ...pinv] = //
        // pWPimmer(storeVal, up)
        safeProduceWithPatches(storeVal, up)
      ;[patches, inverse] = A.map(convertPatchesToStandard)(pinv)
      // ;[patches, inverse] = A.map(identity)(pinv)
      return result as T
    })
    console.log(patches)
    return { patches, inverse }
  }

// export const updateStoreImmer =
//   <T>(store: Writable<T>) =>
//   (up: (arg: UnFreeze<T>) => void) => {
//     let [patches, inverse]: Patch[][] = [[], []]
//     store.update((storeVal) => {
//       let [result, ...pinv] = //
//         pWPimmer(storeVal, up)
//       ;[patches, inverse] = pinv
//       return result as T
//     })

//     return { patches, inverse }
//   }
