import { NoteSync, chainN, domainTitle, type Notes } from "shared"
import type { Src } from "shared"
import { option as O, map as M } from "fp-ts"
import { flow, pipe } from "fp-ts/lib/function"
import { derived, writable, type Readable, type Writable } from "svelte/store"

// const hostnameStr = (url: string) => O.getOrElse(() => "")(hostname(url))

export class NoteMut {
  ns: NoteSync
  currSrc: Readable<Src>
  panels: Readable<Map<number, Notes[]>>
  currSrcs: Writable<Map<number, Src>>
  currWindowId: Readable<number>
  constructor(ns: NoteSync, currWindowId: Readable<number>) {
    this.ns = ns
    // this.currSrc = writable({ title: "", domain: "" })
    this.currWindowId = currWindowId
    this.currSrcs = writable(new Map())
    this.currSrc = derived([this.currSrcs, this.currWindowId], ([srcs, id]) => srcs.get(id) || { title: "", domain: "" })

    this.panels = derived([this.ns.noteStore, this.currSrcs, this.ns.invStuMapStore], ([ns, srcs, isms]) =>
      pipe(srcs,
        M.map(flow(
          O.some,
          O.map(domainTitle),
          chainN(n => isms.get(n)),
          O.map(source_id => [...ns.values()].filter(n => n.source_id == source_id)),
          O.getOrElse<Notes[]>(() => [])),
        ),
      ))
  }
}
