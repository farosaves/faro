import type { NoteEx } from "$lib"
import { record as R, array as A, nonEmptyArray as NA, string as S, option as O } from "fp-ts"
import { derived, writable, type Readable, type Writable } from "svelte/store"
import type { NoteStoreR, STUMapStoreR, SyncLike } from "./sync"
import { pipe } from "fp-ts/lib/function"
import { fillInTitleUrl, filterSort } from "$lib"
import type { UUID } from "crypto"

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
    R.map(filterSort(// ([st, nss]) => pipe(nss.map(x => x.prioritised + 1000), A.reduce(0, Math.max)), // // !hacky + 1000 // so I removed it because it does groups first anyway
      ([st, nss]) => pipe(nss.map(x => x.priority), A.reduce(0, Math.max)),
    )),
  )

export type SyncLikeNStores = SyncLike & { noteStore: NoteStoreR, stuMapStore: STUMapStoreR }
export class NoteDeri {
  sync: SyncLikeNStores
  groupStore: Readable<ReturnType<typeof applyTransform>>
  transformStore: Writable<typeof defTransform>
  noteArr: Readable<NoteEx[]>
  allTags: Readable<string[]>
  constructor(noteSync: SyncLikeNStores) {
    this.sync = noteSync
    this.transformStore = transformStore
    // this.nq = this.sb.from("notes")
    this.noteArr = derived([this.sync.noteStore, this.sync.stuMapStore], ([n, s]) => {
      const vals = [...n.values()]
      return vals.map(n => ({ ...n, sources: fillInTitleUrl(s.get(n.source_id as UUID)), searchArt: O.none }))
    })

    this.groupStore = derived([this.noteArr, this.transformStore], applyTransform)
    this.allTags = derived(this.noteArr, ns => A.uniq(S.Eq)(ns.flatMap(n => n.tags || [])))
  }

  reset_transform = () => this.transformStore.set(defTransform)
}
