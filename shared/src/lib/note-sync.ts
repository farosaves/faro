// note-sync with structura

// @ts-ignore
import { persisted } from "svelte-persisted-store"
import type { InsertNotes, Notes } from "./db/types"
import type { NoteEx, Notess, SourceData, SupabaseClient } from "./db/typeExtras"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import {
  applyPatches,
  fillInTitleUrl, // todo? lol
  filterSort,
  getNotes,
  ifErr,
  ifNError,
  logIfError,
  unwrapTo,
  updateStore,
} from "./utils"
import { option as O, record as R, string as S, array as A, nonEmptyArray as NA } from "fp-ts"
import { flip, flow, identity, pipe } from "fp-ts/lib/function"
import { notesRowSchema } from "./db/schemas"
import { z } from "zod"
import type { Patch } from "structurajs"
import { createMock } from "./db/mock"

type PatchTup = { patches: Patch[]; inverse: Patch[] }

const allNotesR: Record<number, Notes> = {}
export const notestore = persisted("notestore", allNotesR)
// this block shall ensure local data gets overwritten on db schema changes
const validateNs = z.record(z.string(), notesRowSchema).parse
// prettier-ignore
notestore.update(ns => pipe(() =>validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))

const validateSTUMap = z.record(z.string(), z.object({ title: z.string(), url: z.string() })).parse
type STUMap = ReturnType<typeof validateSTUMap>
const stuMap: STUMap = {}
const stuMapStore = persisted("stuMapStore", stuMap)
// prettier-ignore
stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))
// stuMapStore.set(stuMap)  // need to add it when changing dashboard/+page.server.ts

const defTransform = (n: NoteEx) => ({ ...n, priority: Date.parse(n.created_at) })
const transformStore = writable(defTransform)

const undo_queue: PatchTup[] = []
const redo_queue: PatchTup[] = []
// each patch may need validation if persisted..
const _note_del_queue: Notess = []
const note_del_queue = persisted("note_del_queue", _note_del_queue)

const __f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof __f>
const applyTransform = ([ns, transform]: [NoteEx[], typeof defTransform]) =>
  pipe(
    ns,
    A.map(transform),
    A.filter((n) => n.priority > 0),
    NA.groupBy((n) => n.sources.title),
    R.toArray<string, (NoteEx & { priority: number })[]>,
    filterSort(([st, nss]) =>
      pipe(
        nss.map((x) => x.priority),
        A.reduce(0, Math.max),
      ),
    ),
  )

export class NoteSync {
  sb: SupabaseClient
  notestore: Writable<Record<string, Notes>>
  noteArr: Readable<NoteEx[]>
  private user_id: string | undefined
  note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  alltags: Readable<string[]>
  transformStore: Writable<(x: NoteEx) => NoteEx & { priority: number }>
  groupStore: Readable<ReturnType<typeof applyTransform>>

  constructor(sb: SupabaseClient, user_id: string | undefined) {
    this.sb = sb
    this.notestore = notestore
    this.stuMapStore = stuMapStore
    this.user_id = user_id
    this.note_del_queue = note_del_queue
    this.noteArr = derived([this.notestore, this.stuMapStore], ([n, s]) => {
      const vals = Object.values(n)
      return vals.map((n) => ({ ...n, sources: fillInTitleUrl(s[n.source_id]), searchArt: O.none }))
    })
    this.alltags = derived(this.noteArr, (ns) => A.uniq(S.Eq)(ns.flatMap((n) => n.tags || [])))
    this.transformStore = transformStore
    // this.nq = this.sb.from("notes")
    this.groupStore = derived([this.noteArr, this.transformStore], applyTransform)
  }
  inited = () => this.user_id !== undefined

  setUid = (user_id: string) => {
    this.user_id = user_id
    this.notestore.update(R.filter((n) => n.user_id == user_id))
  }

  refresh_sources = async () =>
    this.user_id !== undefined &&
    this.stuMapStore.update(
      unwrapTo(
        pipe(
          (await this.sb.from("sources").select("*, notes (user_id)").eq("notes.user_id", this.user_id)).data,
          O.fromNullable,
          O.map((data) => Object.fromEntries(data.map((n) => [n.id, fillInTitleUrl(n)]))),
        ),
      ),
    )

  update_source = async (id: string, { sources }: SourceData) =>
    this.stuMapStore.update(R.upsertAt(id, sources))

  reset_transform = () => this.transformStore.set(defTransform)

  refresh_notes = async (id: O.Option<string> = O.none) =>
    this.user_id !== undefined &&
    (await getNotes(this.sb, id, this.user_id).then((nns) =>
      this.notestore.set(Object.fromEntries(nns.map((n) => [n.id, n]))),
    ))

  action =
    <T extends PromiseLike<{ error: any }>>(f: (a: NQ) => T) =>
    (patchTup: PatchTup) =>
      f(this.sb.from("notes"))
        .then(logIfError)
        .then((e) => {
          console.log(patchTup)
          return e
        })
        .then(ifErr(() => updateStore(this.notestore)(applyPatches(patchTup.inverse))))

  addF = async (note: Notes) => {
    const { patches, inverse } = updateStore(this.notestore)((x) => {
      x[note.id] = note
    })
    await this.action((x) => x.insert(note))
  }

  add = async (note: InsertNotes, source_id: string) => {
    const n = { ...createMock(), note }
  }

  deleteit = async (note: Notes) => {
    const patchTup = updateStore(this.notestore)((ns) => R.filter((n: Notes) => n.id != note.id)(ns))
    await this.action((x) => x.delete().eq("id", note.id))(patchTup)
  }

  tagUpdate = (note: Notes) => async (tag: string, tags: string[]) => {
    const patchTup = updateStore(this.notestore)((ns) => {
      Object.values(ns).filter((n) => n.id == note.id)[0].tags = tags
    })
    this.action((x) => x.update({ tags }).eq("id", note.id))(patchTup)
  }

  restoredelete = () => {
    this.note_del_queue.update((ns) => {
      const [r, ...rs] = ns
      if (!r) return ns // noop
      this.addF(r)
      return rs
    })
  }
  savedelete = (n: NoteEx) => this.note_del_queue.update((ns) => [n, ...ns])

  sub = () => {
    this.sb
      .channel("notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${this.user_id}`,
        },
        (payload: { new: Notes | object }) => {
          if ("id" in payload.new) {
            const nn = payload.new
            const id = updateStore(this.notestore)((ns) => {
              ns[nn.id] = nn
            })
            const a = R.lookup(nn.source_id.toString())(get(this.stuMapStore))
          } else this.refresh_notes()
        },
      )
      .subscribe()
  }
}
