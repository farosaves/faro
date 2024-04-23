import { NoteSync, chainN, domainTitle, type Notes } from "shared"
import type { Src } from "shared"
import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import { derived, writable, type Readable, type Writable } from "svelte/store"

// const hostnameStr = (url: string) => O.getOrElse(() => "")(hostname(url))

export class NoteMut {
  ns: NoteSync
  currSrc: Readable<Src>
  panel: Readable<Notes[]>
  currSrcs: Writable<Map<number, Src>>
  currWindowId: Writable<number>
  constructor(ns: NoteSync) {
    this.ns = ns
    // this.currSrc = writable({ title: "", domain: "" })
    this.currWindowId = writable(NaN)
    this.currSrcs = writable(new Map())
    this.currSrc = derived([this.currSrcs, this.currWindowId], ([srcs, id]) => srcs.get(id) || { title: "", domain: "" })

    this.panel = derived([this.ns.noteStore, this.currSrc, this.ns.invStuMapStore], ([ns, src, isms]) =>
      pipe(
        O.some(src),
        O.map(domainTitle),
        chainN(n => isms.get(n)),
        O.map(source_id => [...ns.values()].filter(n => n.source_id == source_id)),
        O.getOrElse<Notes[]>(() => [])),
    )
  }
}
