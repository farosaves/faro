import { persisted } from "svelte-persisted-store"
import {
  NoteSync,
  domain_title,
  getOrElse,
  hostname,
  idx,
  logIfError,
  type Notes,
  type SourceData,
} from "shared"
import { createMock, type MockNote } from "./utils"
import { option as O, record as R, string as S, array as A, tuple as T } from "fp-ts"
import { pipe, flow, flip, identity } from "fp-ts/lib/function"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import { invertLast } from "fp-ts-std/Record"
type Src = SourceData["sources"]

const hostnameStr = (url: string) => O.getOrElse(() => "")(hostname(url))

export class NoteMut {
  ns: NoteSync
  curr_source: Writable<O.Option<[Src, number]>>
  panel: Readable<Notes[]>
  source_idStore
  constructor(ns: NoteSync) {
    this.ns = ns
    this.curr_source = writable(O.none)
    this.panel = derived([this.ns.notestore, this.curr_source], ([ns, ots]) =>
      pipe(
        ots,
        O.map((ts) => Object.values(ns).filter((n) => n.source_id == ts[1])),
        getOrElse(() => []),
      ),
    )
    this.source_idStore = derived(
      ns.stuMapStore,
      flow(
        R.map(({ url, title }) => domain_title(url, title)),
        R.compact,
        invertLast(identity),
        R.map(parseInt),
      ),
    )
  }

  _updateSrc = (source: Src, id: number) => {
    this.curr_source.set(O.some([source, id]))
    const { title, url } = source
    this.ns.update_source(id, { sources: source })
    return id
  }

  // get source if already present locally
  localSrcId = (source: Src) => {
    // get current
    const optIdC = pipe(
      get(this.curr_source),
      O.chain(O.fromPredicate(([src, id]) => R.getEq(S.Eq).equals(src, source))),
      O.map((t) => t[1]),
    )
    if (O.isSome(optIdC)) return optIdC
    // get store
    const { url, title } = source
    const optId = O.chain((dt: string) => idx(get(this.source_idStore), dt))(domain_title(url, title))
    if (O.isSome(optId)) return O.some(this._updateSrc(source, optId.value))
    // stil we're on not inserted so set to none:
    this.curr_source.set(O.none)
    return O.none
  }
  // get locally or db
  _updatedSrcId = async (source: Src) => {
    const localId = this.localSrcId(source)
    if (O.isSome(localId)) return localId
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

    const { data: data2, error } = await this.ns.sb
      .from("sources")
      .insert({ domain: hostnameStr(url), url, title })
      .select("id")
      .maybeSingle()
      .then(logIfError)
    if (data2) return this._updateSrc(source, data2.id)
    throw error // TODO: if doing offline needs to be options
  }

  addNote = async (n: MockNote, source: Src) => {
    const { ...note } = n
    // optimistic

    //
    const source_id = await this.upSetSrcId(source)
    const { data: newNote } = await this.ns.sb
      .from("notes")
      .insert({ ...note, source_id })
      .select()
      .maybeSingle()
    return newNote
  }
}
