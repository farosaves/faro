import type { SourceData, SupabaseClient } from "./db/typeExtras"
import { array as A, option as O, either as E } from "fp-ts"
import { parseISO, max } from "date-fns"
import type { Option } from "fp-ts/lib/Option"
import { flow, identity, pipe } from "fp-ts/lib/function"
import type { LazyArg } from "fp-ts/lib/function"
import { writable, type Writable } from "svelte/store"
import { Observable } from "rxjs"
import type { Patch } from "immer"
import { v5 } from "uuid"
// import { produceWithPatches as pWPimmer, enablePatches } from "immer"

import {
  convertPatchesToStandard,
  applyPatchesMutatively as _applyPatches,
  type UnFreeze,
  safeProduceWithPatches,
} from "structurajs"
import type { UUID } from "crypto"
// setAutoFreeze(false)  only for perf reasons makes sense if tested..


export type Src = SourceData["sources"]
// strips trailing /
export const delTr = (s: string | undefined) => s?.replace(/\/$/, "") || ""
export const API_ADDRESS = delTr(import.meta.env.VITE_PI_IP as string)


export const namespaceUuid: UUID = "0646f4ce-17c9-4a66-963e-280982b6ac8a"
export const uuidv5 = (s: string) => v5(s, namespaceUuid) as UUID

export const elemsOfClass = (cls: string) => document.querySelectorAll(`.${cls}`) as NodeListOf<HTMLElement>

export const browser = () => typeof window !== "undefined" && typeof document !== "undefined" // for SSR
export const ctrlKey = browser() && navigator.userAgent.indexOf("Mac OS X") != -1 ? "\u2318" : "Ctrl"
export const altKey = browser() && navigator.userAgent.indexOf("Mac OS X") != -1 ? "\u2325" : "Alt"


export const getOrElse: <A>(onNone: LazyArg<NoInfer<A>>) => (ma: Option<A>) => A = O.getOrElse

export const mapSome = <U, T>(f: (...args: [U]) => O.Option<T>) => flow(A.map(f), A.flatMap(A.fromOption))

export const mapElse = <T>(v: O.Option<T>) =>
  <U>(f: (a: T) => U, def: U) =>
    pipe(v, O.map(f), O.getOrElse(() => def))


export const partition_by_id = (id: number) => A.partition((v: { id: number }) => v.id == id)
export const delete_by_id = (id: number) => A.filter((v: { id: number }) => v.id !== id)

export function desc<T>(first: (t: T) => number, second: (t: T) => number = t => 0): (t1: T, t2: T) => number {
  return (t1, t2) => first(t2) - first(t1) || second(t2) - second(t1)
}
export const asc
  = <T>(f: (t: T) => number) =>
    (t1: T, t2: T) =>
      f(t1) - f(t2)

export const typeCast = <T>(input: unknown) => input as T

export const note_idKey = "noteUuid"
export const internalSearchParams = ["highlightUuid", note_idKey] as const

export const ifErr
  = <U>(f: (e: U) => void, is = true) =>
    <T extends { error: U }>(r: T) => {
      const { error } = r
      if (!!error == is) f(error)
      return r
    }

export const DEBUG = import.meta.env.VITE_DEBUG == "true" || false

export const ifNErr = <T>(f: (e: T) => void) => ifErr(f, false)
export const funLog = (where = "", from = "") => <T>(n: T) => {
  DEBUG && console.log(from, n, where && ("at" + where))
  return n
}
export type DebugMsg = { severity: "warn" | "info" | "err", where: string, from: string, msg: string }
type _F = (m: DebugMsg) => Promise<unknown>
export const sbLogger = (sb: SupabaseClient): _F => async m => await sb.from("mylogs").insert(m)

export const funLog2 = (f: _F) => (where = "", from = "") => <T>(n: T) => {
  if (DEBUG) console.log(from, n, where && ("at" + where))
  else f({ where, from, severity: "info", msg: JSON.stringify(n) })
  return n
}
export const funWarn = (f: _F) => (where = "", from = "") => <T>(n: T) => {
  if (DEBUG) console.warn(from, n, where && ("at" + where))
  else f({ where, from, severity: "warn", msg: JSON.stringify(n) })
  return n
}
export const funErr = (f: _F) => (where = "", from = "") => <T>(n: T) => {
  if (DEBUG) console.error(from, n, where && ("at" + where))
  else f({ where, from, severity: "err", msg: JSON.stringify(n) })
  return n
}

export const logIfError = (where = "") => ifErr(funLog(where, "logIfError log"))
export const warnIfError = (f: _F) => (where = "") => ifErr(funWarn(f)(where, "warnIfError log"))

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
export const host = (s: string) => O.tryCatch(() => new URL(s).host)

// export const domain_title = (url: string, title: string) => O.map(s => [s, title].join(";"))(hostname(url))
export const domainTitle = (src: Src) => [src.domain, src.title].join(";")

// sort descendingly but for negative scores filter out
export const filterSort
  = <T>(first: (x: T) => number, second = first) =>
    (xs: T[]) =>
      xs.filter(x => first(x) > 0).toSorted(desc(first, second))

export const chainN = <T, U>(f: (a: T) => U | undefined | null) => O.chain(flow(f, O.fromNullable))
// export const TOofPromise = <T>(x: Promise<T>) => pipe(() => x.then(O.fromNullable))
// TO.fromTask,
// TO.chain(x => async () => O.fromNullable(x)))

// TODO x => () => f(x)

// type T = {
//   title: string | null
//   urls: string[]
// } | undefined
// export const fillInTitleUrl = (v: T) => {
//   return { title: v?.title || "missing Title", url: v?.urls[0] || "" }
// }

type _T = {
  title: string | null
  domain: string | null
} | undefined
export const fillInTitleDomain = (v: _T) => ({ title: v?.title || "missing Title", domain: v?.domain || "" })

// https://github.com/extend-chrome/messages?tab=readme-ov-file#rxjs-observables
export const toStore = <T>(Sub: Observable<T>, init: T) => {
  const store = writable(init)
  Sub.subscribe(store.set)
  return store
}

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
export const maxDate = (dateStrs: string[]) => pipe(
  () => pipe(dateStrs, A.map(parseISO), max, x => x.toISOString()),
  O.tryCatch,
  O.getOrElse(() => new Date(0).toISOString()))


export const getUpdatedNotes = async (supabase: SupabaseClient, user_id: string, lastDate: string) => {
  const { data } = await supabase.from("notes").select("*").eq("user_id", user_id).gt("updated_at", lastDate)
  return data || []
}

export const tup = <T extends [void] | object>(val: T) => val

export const curry2 = <A, B, C>(f: (a: A, b: B) => C) => (a: A) => (b: B) => f(a, b)
export const eq = <T>(a: T) => (b: T) => a == b
export const neq = <T>(a: T) => (b: T) => a != b
export const sum = A.reduce<number, number>(0, (a, b) => a + b)

export const escapeHTML = browser()
  ? (text: string) => {
      const div = document.createElement("div")
      div.innerText = text
      return div.innerHTML
    }
  : identity

export const unwrapTo
  = <T>(x: Option<T>) =>
    (y: T) =>
      O.getOrElse(() => y)(x)

export const invertMap = <K, V>(m: Map<K, V>) => new Map(Array.from(m, ([a, b]) => [b, a]))
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

export const retryOnce = async <T>(f: (() => T), delay = 500, debugMsg = "retry") => {
  const a = E.tryCatch(f, funLog(debugMsg, "retry"))
  if (E.isRight(a)) return a.right
  await sleep(delay)
  return f()
}

export const isMac = () => navigator.userAgent.includes("Mac OS X")
export const isCmd = (e: KeyboardEvent) => isMac() ? e.metaKey : e.ctrlKey
