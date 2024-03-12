// note-sync with structura

// @ts-ignore
import { persisted } from "svelte-persisted-store"
import type { Notes } from "./dbtypes"
import type { NoteEx, Notess, SupabaseClient } from "./first"
import { derived, get, writable, type Writable } from "svelte/store"
import {
  applyPatches,
  fillInTitleUrl, // todo!! delete
  filterSort,
  getNotes,
  getTitlesUrls,
  ifErr,
  ifNError,
  logIfError,
  updateStore,
  type STUMap,
} from "./utils"
import { option as O, record as R, string as S, array as A, nonEmptyArray as NA } from "fp-ts"
import { flip, flow, identity, pipe } from "fp-ts/lib/function"
import type { Patch } from "structurajs"

type PatchTup = { patches: Patch[]; inverse: Patch[] }
const eqIfSome = <T>(n: T) =>
  O.match<T, boolean>(
    () => false,
    (x) => x == n,
  )

const allNotes: Notes[] = []
const allNotesR: Record<number, Notes> = {}
export const notestore = persisted("notestore", allNotesR)
notestore.set(allNotes)
const undo_queue: PatchTup[] = []
const redo_queue: PatchTup[] = []
const _note_del_queue: Notess = []
const note_del_queue = persisted("note_del_queue", _note_del_queue)

const _f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof _f>

export class NoteSync {
  sb: SupabaseClient
  notestore: Writable<Record<number, Notes>>
  user_id: string | undefined
  note_del_queue: Writable<Notess>
  stuMap: STUMap
  // nq
  constructor(sb: SupabaseClient, user_id: string | undefined) {
    this.sb = sb
    this.notestore = notestore
    this.stuMap = {}
    this.user_id = user_id
    this.note_del_queue = note_del_queue
    // this.nq = this.sb.from("notes")
  }
  inited = () => this.user_id !== undefined
  panel(id: number) {
    return derived(
      this.notestore,
      flow(
        Object.values,
        A.filter((n) => n.source_id == id),
      ),
    )
  }
  alltags = () =>
    derived(this.notestore, (ns) => A.uniq(S.Eq)(Object.values(ns).flatMap((n) => n.tags || [])))
  refresh_sources = async () =>
    this.user_id !== undefined
      ? (this.stuMap = await getTitlesUrls(this.sb)(this.stuMap, this.user_id))
      : console.log("what?")

  refresh_notes = async (id: O.Option<number> = O.none): Promise<PatchTup> =>
    this.user_id !== undefined
      ? await getNotes(this.sb, id, this.user_id).then((nns) =>
          //(s) => R.filter((n) => eqIfSome(n.id)(id))(s).concat(nns)
          updateStore(this.notestore)((ns) =>
            R.union({ concat: identity })(ns)(Object.fromEntries(nns.map((n) => [n.id, n]))),
          ),
        )
      : { patches: [], inverse: [] }

  get_groups = (transform: (x: NoteEx) => NoteEx & { priority: number }) =>
    derived(this.notestore, (ns) =>
      pipe(
        Object.values(ns).map((n) => ({ ...n, sources: fillInTitleUrl(this.stuMap[n.source_id]) })),
        A.map(transform), // potentially can add filter here already actually
        A.filter((n) => n.priority > 0),
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
  // could make it even better by wrapping this.sb.from("notes")
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

  // actionCb =
  //   <V extends { error: any }, U extends PromiseLike<V>>(t: U) =>
  //   (patchTup: PatchTup) =>
  //     t.then(logIfError).then(ifErr(() => updateStore(this.notestore)(applyPatches(patchTup.inverse))))

  addit = async (note: Notes) => {
    const { patches, inverse } = updateStore(this.notestore)((x) => {
      x[note.id] = note
    })
    await this.action((x) => x.insert(note))
    // this.actionCb(this.sb.from("notes").insert(note))
  }

  deleteit = async (note: Notes) => {
    const patchTup = updateStore(this.notestore)((ns) => R.filter((n: Notes) => n.id != note.id)(ns))
    await this.action((x) => x.delete().eq("id", note.id))(patchTup)
    // .then(logIfError)
    // .then(ifErr(() => updateStore(this.notestore)(applyPatches(inverse))))
  }

  tagUpdate = (note: Notes) => async (tag: string, tags: string[]) => {
    const patchTup = updateStore(this.notestore)((ns) => {
      Object.values(ns).filter((n) => n.id == note.id)[0].tags = tags
    })
    // console.log(patchTup)
    // await this.action((x) => x.update({ tags }).eq("id", note.id))
    this.action((x) => x.update({ tags }).eq("id", note.id))(patchTup)

    // this.sb
    //   .from("notes")
    //   .update({ tags })
    //   .eq("id", note.id)
    //   .then((x) => x)
    // .then(logIfError)
    // .then(ifErr(() => updateStore(this.notestore)(applyPatches(inverse))))
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

  // sub = (handlePayload: (payload: { new: Notes | {} }) => void) => {
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
            const id = nn.source_id
            updateStore(this.notestore)((ns) => {
              ns[nn.id] = nn
            })
          } else this.refresh_notes()
        },
      )
      .subscribe()
  }
}

// export const handlePayload = (note_sync: NoteSync) => async (payload: { new: Notes | object }) => {
//   if ("id" in payload.new) {
//     const nn = payload.new
//     const id = nn.source_id
//     updateStore(note_sync.notestore)((ns) => {
//       ns[nn.id] = nn
//     })
//   } else note_sync.refresh_notes()
// }
