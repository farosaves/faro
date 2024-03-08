// note-sync with structura

// @ts-ignore
import { persisted } from "svelte-persisted-store"
import type { Notes } from "./dbtypes"
import type { NoteEx, Notess, SupabaseClient } from "./first"
import { derived, get, type Writable } from "svelte/store"
import { filterSort, getNotes, logIfError, partition_by_id, safeGet, updateStore } from "./utils"
import {
  option as O,
  record as R,
  string as S,
  array as A,
  nonEmptyArray as NA,
  taskEither as TE,
} from "fp-ts"
import { flow, pipe } from "fp-ts/lib/function"
import type { Patch } from "structurajs"

type PatchTup = { patches: Patch[]; inverse: Patch[] }

const allNotes: Notess = []
// export type NoteDict = typeof notes
export const notestore = persisted("notestore", allNotes)
const _note_del_queue: Notess = []
const note_del_queue = persisted("note_del_queue", _note_del_queue)

export class NoteSync {
  sb: SupabaseClient
  notestore: Writable<Notess>
  user_id: O.Option<string>
  note_del_queue: Writable<Notess>
  constructor(sb: SupabaseClient, user_id: string | undefined) {
    this.sb = sb
    this.notestore = notestore
    this.user_id = O.fromNullable(user_id)
    this.note_del_queue = note_del_queue
  }
  panel(id: number) {
    return derived(
      this.notestore,
      A.filter((n) => n.source_id == id),
    )
  }
  alltags = () => derived(this.notestore, (ns) => A.uniq(S.Eq)(ns.flatMap((n) => n.tags || [])))
  hasUserId = () => !(this.user_id || console.log("no user in NoteSync"))
  voidFix = (v: void): PatchTup => {
    return { patches: [], inverse: [] }
  }

  refresh_notes = (id: O.Option<number>): Promise<PatchTup> =>
    pipe(
      TE.fromOption(() => "no user id in note sync")(this.user_id),
      TE.chainTaskK((user_id) => () => getNotes(this.sb, id, user_id)),
      TE.match(flow(console.log, this.voidFix), (nns) =>
        updateStore(this.notestore)((s) => s.filter((n) => n.id != O.toNullable(id)).concat(nns)),
      ),
    )()

  get_groups = (transform: (x: NoteEx) => NoteEx & { priority: number }) =>
    derived(this.notestore, (ns) =>
      pipe(
        ns.map(transform), // potentially can add filter here already actually
        NA.groupBy((n) => n.sources.title),
        R.toArray<string, (NoteEx & { priority: number })[]>,
        filterSort(([st, nss]) =>
          pipe(
            nss.map((x) => x.priority),
            A.reduce(0, Math.max),
          ),
        ),
      ),
    )

  addit = async (n: NoteEx) => {
    const cache = get(this.notestore)
    let { title, url } = cache[0]
      ? cache[0].sources
      : (await this.sb.from("sources").select().eq("id", n.source_id).maybeSingle()).data || {}
    title = title || "title missing"
    url = url || ""

    this.notestore.update((s) => {
      let highlightOnMount = true
      s[n.source_id] = [
        ...safeGet(s)(n.source_id),
        { ...n, sources: { title, url }, highlightOnMount } as NoteEx,
      ]
      return s
    })
    const { sources, ...reNote } = n
    await this.sb.from("notes").insert(reNote).then(logIfError).then(this._restoreIE(n, cache))
  }

  restoredelete = () => {
    this.note_del_queue.update((ns) => {
      let [r, ...rs] = ns
      if (!r) return ns // noop
      this.addit(r)
      return rs
    })
  }

  savedelete = (n: NoteEx) => this.note_del_queue.update((ns) => [n, ...ns])
  deleteit = (n: Notes) => {
    const cache = safeGet(get(this.notestore))(n.source_id)

    this.notestore.update((s) => {
      let parts = partition_by_id(n.id)(s[n.source_id])
      s[n.source_id] = parts.left
      this.savedelete(parts.right[0])
      return s
    })

    this.sb.from("notes").delete().eq("id", n.id).then(logIfError).then(this._restoreIE(n, cache))
  }

  tagUpdate = (note: Notes) => (tag: string, tags: string[]) => {
    console.log(note.highlights)
    this.notestore.update((n) => {
      n[note.source_id].filter((_note) => _note.id == note.id)[0].tags = tags
      return n
    })
    this.sb.from("notes").update({ tags }).eq("id", note.id).then(logIfError)
  }

  sub = (handlePayload: (payload: { new: Notes | object }) => void) => {
    this.sb
      .channel("notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${this.user_id}`,
        }, // at least url should be the same so no need to filter
        handlePayload,
      )
      .subscribe()
  }
}
