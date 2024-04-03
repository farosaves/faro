import { NoteSync, chainN, domainTitle, domain_title, funLog, hostname, invertMap, logIfError, type Notes, type SourceData } from "shared"
import { createMock } from "shared"
import type { InsertNotes, PendingNote, Src } from "shared"
import { option as O, record as R, string as S, map as M } from "fp-ts"
import { pipe, flow, flip, identity } from "fp-ts/lib/function"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"

const hostnameStr = (url: string) => O.getOrElse(() => "")(hostname(url))

export class NoteMut {
  ns: NoteSync
  currSrcnId: Writable<O.Option<[Src, string]>>
  panel: Readable<Notes[]>
  constructor(ns: NoteSync) {
    this.ns = ns
    this.currSrcnId = writable(O.none)
    // this.ns.stuMapStore
    // this.currSrcnId.subscribe(funLog("currSrcnId"))
    this.panel = derived([this.ns.noteStore, this.currSrcnId], ([ns, ots]) =>
      pipe(
        ots,
        O.map(ts => [...ns.values()].filter(n => n.source_id == ts[1])),
        O.getOrElse<Notes[]>(() => []),
      ),
    )
  }

  _updateSrc = (source: Src, id: string) => {
    this.currSrcnId.set(O.some([source, id]))
    return id
  }

  // get source if already present locally
  setLocalSrcId = (src: Src) => {
    const optId = this.ns.getSource_id(src)
    if (O.isSome(optId)) return O.some(this._updateSrc(src, optId.value))
    // stil we're on not inserted so set to none:
    this.currSrcnId.set(O.none)
    return O.none
  }

  // get locally or db
  private _updatedSrcId = async (source: Src) => {
    const localId = this.setLocalSrcId(source)
    if (O.isSome(localId)) return localId
    if (!this.ns.online()) return O.none
    const { data } = await this.ns.sb
      .from("sources")
      .select("id")
      .eq("domain", hostnameStr(source.url))
      .eq("title", source.title)
      .maybeSingle()
    if (data) return O.some(this._updateSrc(source, data.id))
    return O.none
  }

  // get locally or db or insert: to be called when adding note
  upSetSrcId = async (source: Src) => {
    const oid = await this._updatedSrcId(source)
    if (O.isSome(oid)) return oid.value

    const { url, title } = source
    const id = crypto.randomUUID()
    // don't select in general
    const { error } = await this.ns.sb
      .from("sources")
      .insert({ id, domain: hostnameStr(url), url, title })
      .then(logIfError("upSetSrcId"))
    if (!error) return this._updateSrc(source, id)
    return null
    // throw error // TODO: if doing offline needs to be options
  }
}
