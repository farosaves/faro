import { array as NoteExP, record as R, nonEmptyArray as NA, option as O, readonlyArray as RA } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import fuzzysort from "fuzzysort"
import { escapeHTML, replacer, type NoteEx } from "shared"
import { derived, writable } from "svelte/store"
import { hostnameStr } from "./utils"

type NoteExP = NoteEx & { priority: number }
export const exclTagSet = writable(new Set<string>([]))
export const tagFilter = derived(exclTagSet, (exclTagSet) => (n: NoteExP) => ({
  ...n,
  priority: pipe(
    NA.fromArray(n.tags),
    O.getOrElse(() => [""]),
    NoteExP.map((s) => !exclTagSet.has(s)),
    NoteExP.reduce(false, (x, y) => x || y),
  )
    ? n.priority
    : 0,
}))

export const fzRes = writable<false | Fuzzysort.KeysResults<NoteEx>>(false)
export const fzSelectedKeys = writable<string[]>([])

const fuzzySortDef: (n: NoteEx) => NoteEx & { priority: number } = (n: NoteEx) => ({
  ...n,
  priority: Date.parse(n.created_at),
})
export const fuzzySort = derived([fzRes, fzSelectedKeys, replacer], ([res, selectedKeys, replacer]) => {
  if (res && res.length) {
    return (n: NoteEx) => {
      let priority: number
      let searchArt
      let title: string
      if (res && res.length) {
        priority = pipe(
          Array.from(res),
          NoteExP.findFirstMap((r) => (r.obj.id == n.id ? O.some(r.score + 1_000_000) : O.none)),
          O.match(() => 0, identity),
        )
        searchArt = pipe(
          Array.from(res),
          NoteExP.findFirst((r) => r.obj.id == n.id),
          O.map((optKR) => ({ selectedKeys, optKR })),
        )
        // todo this is almost the same as one in shared _Note
        title = pipe(
          searchArt,
          O.chain(({ selectedKeys, optKR }) =>
            pipe(
              selectedKeys,
              NoteExP.findIndex((n) => n == "sources.title"),
              O.chain((i) => O.fromNullable(optKR[i])),
              O.map((r) => {
                const target = escapeHTML(r.target)
                return fuzzysort.highlight({ ...r, target }, replacer)?.join("")
              }),
              O.chain(O.fromNullable),
            ),
          ),
          O.getOrElse(() => n.sources.title),
        )
      } else {
        priority = Date.parse(n.created_at)
        searchArt = O.none
        title = n.sources.title
      }
      const sources = { url: n.sources.url, title }
      return { ...n, priority, searchArt, sources }
    }
  } else {
    return fuzzySortDef
  }
})

export const uncheckedDomains = writable(new Set<string>())
export const domainFilter = derived(uncheckedDomains, (d) => (n: NoteExP) => {
  if (d.has(hostnameStr(n))) n.priority = 0
  return n
})
