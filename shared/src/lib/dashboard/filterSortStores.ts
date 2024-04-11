import type { NoteEx, SourceData } from "$lib/db/typeExtras"
import { replacer } from "$lib/stores"
import { chainN, escapeHTML, hostname } from "$lib/utils"
import { array as A, nonEmptyArray as NA, option as O } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import fuzzysort from "fuzzysort"
import { derived, writable } from "svelte/store"
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

const priorities = ["star", "none", "archive"] as const
const tr = { "5": "star", "0": "none", "-5": "archive" } as const
export const selectedPriorities = writable(new Set(priorities))
export const priorityFilter = derived(selectedPriorities, p => (n: _A) => {
  if (!p.has(tr[(n.prioritised).toString() as "-5" | "0" | "5"])) n.priority = 0
  return n
})


export const uncheckedDomains = writable(new Set<string>())
export const domainFilter = derived(uncheckedDomains, d => (n: _A) => {
  if (d.has(hostnameStr(n))) n.priority = 0
  return n
})

export const fzRes = writable<false | Fuzzysort.KeysResults<NoteEx>>(false)
export const fzSelectedKeys = writable<string[]>([])

export const newestFirst = writable(true)

const fuzzySortDef = (newestFirst: boolean) => ({ f: (n: NoteEx): NoteEx & { priority: number } => ({
  ...n,
  priority: newestFirst ? Date.parse(n.created_at) : Date.now() - Date.parse(n.created_at),
}), overrideGroups: false })

export const fuzzySort = derived([fzRes, fzSelectedKeys, replacer, newestFirst], ([res, selectedKeys, replacer, newestFirst]) => {
  if (res && res.length) {
    return ({ f: (n: NoteEx) => {
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
              chainN(i => optKR[i]),
              chainN((r) => {
                const target = escapeHTML(r.target)
                return fuzzysort.highlight({ ...r, target }, replacer)?.join("")
              }),
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
    }, overrideGroups: true })
  } else {
    return fuzzySortDef(newestFirst)
  }
})
