import { NoteSync, chainN, domainTitle, domain_title, funLog, hostname, invertMap, logIfError, type Notes, type SourceData } from "shared"
import { createMock } from "shared"
import type { InsertNotes, PendingNote, Src } from "shared"
import { option as O, record as R, string as S, map as M } from "fp-ts"
import { pipe, flow, flip, identity } from "fp-ts/lib/function"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"

const hostnameStr = (url: string) => O.getOrElse(() => "")(hostname(url))

export class NoteMut {
  ns: NoteSync
  currSrc: Writable<O.Option<Src>>
  panel: Readable<Notes[]>
  constructor(ns: NoteSync) {
    this.ns = ns
    this.currSrc = writable(O.none)
    // this.ns.stuMapStore
    // this.currSrcnId.subscribe(funLog("currSrcnId"))
    this.panel = derived([this.ns.noteStore, this.currSrc, this.ns.invStuMapStore], ([ns, srcOpt, isms]) =>
      pipe(
        srcOpt,
        O.chain(domainTitle),
        chainN(n => isms.get(n)),
        O.map(source_id => [...ns.values()].filter(n => n.source_id == source_id)),
        O.getOrElse<Notes[]>(() => [])),
    )
  }

  setLocalSrcId = (src: Src) => {
    this.currSrc.set(O.some(src))
  }
}
