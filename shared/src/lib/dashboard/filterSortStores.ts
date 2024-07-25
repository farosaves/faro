import type { NoteEx } from "$lib/db/typeExtras"
import { replacer } from "$lib/utils"
import { persisted } from "$lib/sync/persisted-store"
import { chainN, escapeHTML, getOrElse } from "$lib/utils"
import { array as A, nonEmptyArray as NA, option as O } from "fp-ts"
import { identity, pipe } from "fp-ts/lib/function"
import { derived, writable } from "svelte/store"
import { z } from "zod"
import * as devalue from "devalue"
import fuzzysort from "fuzzysort"

const _exclTagSets = {
  sets: { "": new Set([]) } as Record<string, Set<string>>,
  currId: "",
}

// const highlightId =

export const exclTagSets = writable(_exclTagSets) // { serializer: devalue })
// export const exclTagSets = persisted<typeof _exclTagSets>("exclTagSets", _exclTagSets, { serializer: devalue }) // )
const validate = z.object({ sets: z.record(z.string(), z.set(z.string())), currId: z.string() }).parse
exclTagSets.update(ns => pipe(() => validate(ns), O.tryCatch, O.getOrElse(() => _exclTagSets)))

export const exclTagSet = derived(exclTagSets, ({ sets, currId }) => sets[currId] || new Set())

type _A = NoteEx & { priority: number }

export const tagFilter = derived(exclTagSet, set => (n: _A) => ({
  ...n,
  priority: pipe(
    NA.fromArray(n.tags),
    O.getOrElse(() => [""]),
    A.map(s => !set.has(s)),
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
export const twoPlusTags = writable(false)
export const twoPlusTagFilter = derived(twoPlusTags, useIt => (n: _A) => useIt ? ({ ...n, priority: n.priority * +(n.tags.length > 1) }) : n)

export const uncheckedDomains = persisted<Set<string>>("uncheckedDomains", new Set(), { serializer: devalue })
const validatUD = z.set(z.string()).parse
uncheckedDomains.update(ns => pipe(() => validatUD(ns), O.tryCatch, getOrElse(() => new Set())))
export const domainFilter = derived(uncheckedDomains, d => (n: _A) => {
  if (d.has(n.sources.domain)) n.priority = 0
  return n
})

export const fzRes = writable<false | Fuzzysort.KeysResults<NoteEx>>(false)
export const fzSelectedKeys = writable<string[]>([])

export const newestFirst = writable(true)

const fuzzySortDef = (newestFirst: boolean) => ({ f: (n: NoteEx): NoteEx & { priority: number } => ({
  ...n,
  priority: newestFirst ? Date.parse(n.created_at) : Date.now() - Date.parse(n.created_at),
}), overrideGroups: false })

export const fuzzySort = derived([fzRes, fzSelectedKeys, newestFirst], ([res, selectedKeys, newestFirst]) => {
  if (res && res.length) {
    const [a1, b1] = escapeHTML(replacer("split")).split("split")
    const [a2, b2] = replacer("split").split("split")

    return ({ f: (n: NoteEx) => {
      let priority: number
      let searchArt
      let title: string
      if (res && res.length) {
        priority = pipe(
          Array.from(res),
          A.findFirstMap(r => (r.obj.id == n.id ? O.some(r.score) : O.none)),
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
              chainN(r => // no empty string
                escapeHTML(fuzzysort.highlight(r, replacer)?.join("") || "")
                  .replaceAll(a1, a2)
                  .replaceAll(b1, b2) || undefined,
              ),
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
      const sources = { domain: n.sources.domain, title }
      return { ...n, priority, searchArt, sources }
    }, overrideGroups: true })
  } else {
    return fuzzySortDef(newestFirst)
  }
})
