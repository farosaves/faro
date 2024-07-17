import type { SourceData, SupabaseClient } from "./db/typeExtras"
import { array as A, option as O, either as E } from "fp-ts"
import type { Option } from "fp-ts/lib/Option"
import { flow, identity, pipe } from "fp-ts/lib/function"
import type { LazyArg } from "fp-ts/lib/function"
import { writable } from "svelte/store"
import { Observable } from "rxjs"
import { v5 } from "uuid"
// import { produceWithPatches as pWPimmer, enablePatches } from "immer"

export const domainTitle = (src: Src) => [src.domain, src.title].join(";")

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

export const replacer = (capture: string) => "<b class=\"dark:text-yellow-100\">" + capture + "</b>"
export const updateTheme = () => {
  if (window.getComputedStyle(document.documentElement).getPropertyValue("color-scheme") == "dark")
    document.documentElement.classList.add("dark")
  else
    document.documentElement.classList.remove("dark")
}

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
export const uuidRegex = /^([0-9a-f]*-){4}[0-9a-f]*$/

export const ifNErr = <T>(f: (e: T) => void) => ifErr(f, false)
const doLog = () => DEBUG || (typeof window === typeof undefined) || window.location.href.startsWith("chrome-extension://")
export const funLog = (where = "", from = "") => <T>(n: T) => {
  doLog() && console.log(from, n, where && ("at" + where))
  return n
}
export type DebugMsg = { severity: "warn" | "info" | "err", where: string, from: string, msg: string }
type _F = (m: DebugMsg) => Promise<unknown>
export const sbLogger = (sb: SupabaseClient): _F => async m => await sb.from("mylogs").insert(m)// .then(console.log)

export const funLog2 = (f: _F) => (where = "", from = "") => <T>(n: T) => {
  if (doLog()) console.log(from, n, where && ("at" + where))
  if (!DEBUG) f({ where, from, severity: "info", msg: JSON.stringify(n) })
  return n
}
export const funWarn = (f: _F) => (where = "", from = "") => <T>(n: T) => {
  if (doLog()) console.warn(from, n, where && ("at" + where))
  if (!DEBUG) f({ where, from, severity: "warn", msg: JSON.stringify(n) })
  return n
}
export const funErr = (f: _F) => (where = "", from = "") => <T>(n: T) => {
  if (doLog()) console.error(from, n, where && ("at" + where))
  if (!DEBUG) f({ where, from, severity: "err", msg: JSON.stringify(n) })
  return n
}

export const logIfError = (where = "") => ifErr(funLog(where, "logIfError log"))
export const warnIfError = (f: _F) => (where = "") => ifErr(funWarn(f)(where, "warnIfError log"))

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
export const host = (s: string) => O.tryCatch(() => new URL(s).host)

// sort descendingly but for negative scores filter out
export const filterSort
  = <T>(first: (x: T) => number, second = first) =>
    (xs: T[]) =>
      xs.filter(x => first(x) > 0).toSorted(desc(first, second))

export const chainN = <T, U>(f: (a: T) => U | undefined | null) => O.chain(flow(f, O.fromNullable))


// https://github.com/extend-chrome/messages?tab=readme-ov-file#rxjs-observables
export const toStore = <T>(Sub: Observable<T>, init: T) => {
  const store = writable(init)
  Sub.subscribe(store.set)
  return store
}

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
export const invertMap = <K, V>(m: Map<K, V>) => new Map(Array.from(m, ([a, b]) => [b, a]))

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


export const retryOnce = async <T>(f: (() => T), delay = 500, debugMsg = "retry") => {
  const a = E.tryCatch(f, funLog(debugMsg, "retry"))
  if (E.isRight(a)) return a.right
  await sleep(delay)
  return f()
}

export const isMac = () => navigator.userAgent.includes("Mac OS X")
export const isCmd = (e: KeyboardEvent | MouseEvent) => isMac() ? e.metaKey : e.ctrlKey

export const getKey = async (sb: SupabaseClient) =>
  (await sb.from("keys").select("*").maybeSingle().then(warnIfError(sbLogger(sb))("getKey"))).data?.key || undefined

export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {}
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}

// export const pickFields = <T, K extends keyof T>(obj: T, keys: Readonly<K[]>) => A.map()
export const pickFields = <T, K extends keyof T>(obj: T) => A.map((k: K) => obj[k])

export const union = <T, U>(obj1: T, obj2: U): T & U => ({ ...obj1, ...obj2 })

