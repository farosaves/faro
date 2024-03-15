import { NoteSync, hostname, logIfError, type SourceData } from "shared"
import { createMock, type MockNote } from "./utils"
import { option as O, record as R, string as S, array as A } from "fp-ts"
import { pipe, flow } from "fp-ts/lib/function"
import { derived } from "svelte/store"
type Src = SourceData["sources"]

R.getEq(S.Eq)

export class NoteMut {
  ns: NoteSync
  curr_source: O.Option<[Src, number]>
  constructor(ns: NoteSync) {
    this.ns = ns
    this.curr_source = O.none
  }

  panel(id: number) {
    return derived(
      this.ns.notestore,
      flow(
        Object.values,
        A.filter((n) => n.source_id == id),
      ),
    )
  }

  upSetSrcId = async (source: Src) => {
    // extract source id (number) from curr_source
    // if curr_source is some check Src matches and return the number, otherwise none
    const optId = pipe(
      this.curr_source,
      O.chain(O.fromPredicate(([src, id]) => R.getEq(S.Eq).equals(src, source))),
      O.map((t) => t[1]),
    )
    if (O.isSome(optId)) return optId.value

    // if (O.getEq(R.getEq(S.Eq)).equals(O.some(sources), this.curr_source)) return
    const { data } = await this.ns.sb
      .from("sources")
      .select("id")
      .eq("domain", hostname(source.url))
      .eq("title", source.title)
      .maybeSingle()
    if (data) {
      this.curr_source = O.some([source, data.id])
      return data.id
    }
    const { data: data2, error } = await this.ns.sb
      .from("sources")
      .insert({
        domain: hostname(source.url),
        url: source.url,
        title: source.title,
      })
      .select("id")
      .maybeSingle()
      .then(logIfError)
    if (data2) {
      this.curr_source = O.some([source, data2.id])
      return data2.id
    }
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
