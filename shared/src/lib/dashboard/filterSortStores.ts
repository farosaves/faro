import type { NoteEx, SourceData } from "$lib/db/typeExtras"
import { replacer } from "$lib/stores"
import { escapeHTML, hostname } from "$lib/utils"
import { array as A, record as R, nonEmptyArray as NA, option as O, readonlyArray as RA } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import fuzzysort from "fuzzysort"
import { derived, get, writable, type Writable } from "svelte/store"
const hostnameStr = (n: SourceData) => O.getOrElse(() => "")(hostname(n.sources.url))

const _exclTagSets = {
  sets: { "": new Set([]) } as Record<string, Set<string>>,
  currId: "",
}

export const exclTagSets = writable(_exclTagSets) // { serializer: devalue })
export const exclTagSet = derived(exclTagSets, ({ sets, currId }) => sets[currId])

type _A = NoteEx & { priority: number }
export const tagFilter = derived(exclTagSets, ({ sets, currId }) => (n: _A) => ({
  ...n,
  priority: pipe(
    NA.fromArray(n.tags),
    O.getOrElse(() => [""]),
    A.map(s => !sets[currId].has(s)),
    A.reduce(false, (x, y) => x || y),
  )
    ? n.priority
    : 0,
}))

export const uncheckedDomains = writable(new Set<string>())
export const domainFilter = derived(uncheckedDomains, d => (n: _A) => {
  if (d.has(hostnameStr(n))) n.priority = 0
  return n
})

export const fzRes = writable<false | Fuzzysort.KeysResults<NoteEx>>(false)
export const fzSelectedKeys = writable<string[]>([])

export const newestFirst = writable(true)

const fuzzySortDef = (newestFirst: boolean) => (n: NoteEx): NoteEx & { priority: number } => ({
  ...n,
  priority: newestFirst ? Date.parse(n.created_at) : Date.now() - Date.parse(n.created_at),
})
console.log([fzRes, fzSelectedKeys, replacer, newestFirst])
export const fuzzySort = derived([fzRes, fzSelectedKeys, replacer, newestFirst], ([res, selectedKeys, replacer, newestFirst]) => {
  if (res && res.length) {
    return (n: NoteEx) => {
      let priority: number
      let searchArt
      let title: string
      if (res && res.length) {
        priority = pipe(
          Array.from(res),
          A.findFirstMap(r => (r.obj.id == n.id ? O.some(r.score + 1_000_000) : O.none)),
          O.match(() => 0, identity),
        )
        searchArt = pipe(
          Array.from(res),
          A.findFirst(r => r.obj.id == n.id),
          O.map(optKR => ({ selectedKeys, optKR })),
        )
        // todo this is almost the same as one in shared _Note
        title = pipe(
          searchArt,
          O.chain(({ selectedKeys, optKR }) =>
            pipe(
              selectedKeys,
              A.findIndex(n => n == "sources.title"),
              O.chain(i => O.fromNullable(optKR[i])),
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
        const createdMilis = Date.parse(n.created_at)
        priority = newestFirst ? createdMilis : Date.now() - createdMilis
        searchArt = O.none
        title = n.sources.title
      }
      const sources = { url: n.sources.url, title }
      return { ...n, priority, searchArt, sources }
    }
  } else {
    return fuzzySortDef(newestFirst)
  }
})
