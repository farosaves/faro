import type { NoteEx } from "$lib"
import { record as R, array as A, nonEmptyArray as NA, string as S, option as O, tuple as T } from "fp-ts"
import { derived, writable, type Readable, type Writable } from "svelte/store"
import type { NoteStoreR, STUMapStoreR, SyncLike } from "./sync"
import { pipe, flow } from "fp-ts/lib/function"
import { filterSort, desc, descS, fillInTitleDomain, itFilter, itMap } from "$lib"
import type { UUID } from "crypto"
import { gotoFunction } from "$lib/dashboard/utils"
import type { Note } from "$lib/db/typeExtras"

const defTransform = { f: (n: NoteEx) => ({ ...n, priority: Date.parse(n.created_at) }), overrideGroups: false }
const transformStore = writable(defTransform)

// each patch may need validation if persisted..

const recordDefaults = <T extends string>(flds: T[]) => <U>(r: Record<string, U[]>) => {
  flds.forEach(s => R.has(s, r) || (r[s] = []))
  return r as Record<T, U[]>
}

const applyTransform = ([ns, transform]: [NoteEx[], typeof defTransform]) =>
  pipe(
    ns,
    A.map(transform.f),
    A.filter(n => n.priority > 0),
    NA.groupBy(n => transform.overrideGroups ? "0" : n.prioritised.toString()),
    recordDefaults(["5", "0", "-5"]),
    R.map(NA.groupBy(n => n.sources.title)),
    R.map(R.toArray<string, (NoteEx & { priority: number })[]>),
    R.map(filterSort(
      flow(T.snd, A.map(x => x.priority), A.reduce(0, Math.max)), // sort groups by max highest priority
    )),
    R.map(A.map(T.mapSnd(filterSort(x => x.priority)))), // sort within groups by highest priority
  )

export type SyncLikeNStores = SyncLike & { noteStore: NoteStoreR, stuMapStore: STUMapStoreR }
export class NoteDeri {
  sync: SyncLikeNStores
  groupStore: Readable<ReturnType<typeof applyTransform>>
  transformStore: Writable<typeof defTransform>
  noteArr: Readable<NoteEx[]>
  allTags: Readable<string[]>
  first
  openFirst: Readable<() => void>
  idHighlighted: Readable<string>
  searching
  constructor(noteSync: SyncLikeNStores) {
    this.sync = noteSync
    this.transformStore = transformStore
    // this.nq = this.sb.from("notes")
    this.noteArr = derived([this.sync.noteStore, this.sync.stuMapStore], ([ns, s]) =>
      Array.from(pipe(ns.values(),
        itFilter(n => !!n.source_id),
        itMap(n => ({ ...(n as Note), sources: fillInTitleDomain(s.get(n.source_id as UUID)), searchArt: O.none })))),
    )

    this.groupStore = derived([this.noteArr, this.transformStore], applyTransform)
    this.allTags = derived(this.noteArr, ns => pipe(ns.toSorted(descS(x => x.updated_at)),
      A.flatMap(n => n.tags || []), A.uniq(S.Eq))) // ns => A.uniq(S.Eq)(ns.flatMap(n => n.tags || []))
    this.first = derived(
      this.groupStore,
      r => pipe(r, R.toArray, A.map(T.snd), A.flatMap(A.flatMap(T.snd))).toSorted(desc(x => x.priority)).at(0),
    )
    this.openFirst = derived(this.first, gotoFunction)
    this.searching = writable(false)
    this.idHighlighted = derived([this.searching, this.first], x => x[0] ? x[1]?.id || "" : "")
  }

  reset_transform = () => this.transformStore.set(defTransform)
}
