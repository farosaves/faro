import { array as A, record as R, nonEmptyArray as NA, option as O, readonlyArray as RA } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import fuzzysort from "fuzzysort"
import { escapeHTML, replacer, type NoteEx } from "shared"
import { derived, get, writable, type Writable } from "svelte/store"
import { hostnameStr } from "./utils"
import { persisted } from "svelte-persisted-store"
import * as devalue from "devalue"
import { z } from "zod"

const _exclTagSets = {
  ss: { "": new Set([]) } as Record<string, Set<string>>,
  ui: "",
}

// type ExclTagSets = typeof _exclTagSet & { curr: () => Set<string> }

export const currTagSet = (t: typeof _exclTagSets) => t.ss[t.ui]

// export const exclTagSets = persisted("exclTagSets", _exclTagSets, { serializer: devalue })
export const exclTagSets = writable(_exclTagSets) // { serializer: devalue })

// const exclTagSet = derived(exclTagSets, ({ ss, ui }) => ss[O.getOrElse(() => "")(ui)])
// const exclTagSet = derived(exclTagSets, ({ ss, ui }) => ss[ui])
type _A = NoteEx & { priority: number }
export const tagFilter = derived(exclTagSets, ({ ss, ui }) => (n: _A) => ({
  ...n,
  priority: pipe(
    NA.fromArray(n.tags),
    O.getOrElse(() => [""]),
    A.map((s) => !ss[ui].has(s)),
    A.reduce(false, (x, y) => x || y),
  )
    ? n.priority
    : 0,
}))

export const uncheckedDomains = writable(new Set<string>())
export const domainFilter = derived(uncheckedDomains, (d) => (n: _A) => {
  if (d.has(hostnameStr(n))) n.priority = 0
  return n
})

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
          A.findFirstMap((r) => (r.obj.id == n.id ? O.some(r.score + 1_000_000) : O.none)),
          O.match(() => 0, identity),
        )
        searchArt = pipe(
          Array.from(res),
          A.findFirst((r) => r.obj.id == n.id),
          O.map((optKR) => ({ selectedKeys, optKR })),
        )
        // todo this is almost the same as one in shared _Note
        title = pipe(
          searchArt,
          O.chain(({ selectedKeys, optKR }) =>
            pipe(
              selectedKeys,
              A.findIndex((n) => n == "sources.title"),
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
