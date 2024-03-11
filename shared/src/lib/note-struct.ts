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
  logIfError,
  updateStore,
  type STUMap,
} from "./utils"
import { option as O, record as R, string as S, array as A, nonEmptyArray as NA } from "fp-ts"
import { flip, flow, pipe } from "fp-ts/lib/function"
import type { Patch } from "structurajs"

type PatchTup = { patches: Patch[]; inverse: Patch[] }
const eqIfSome = <T>(n: T) =>
  O.match<T, boolean>(
    () => false,
    (x) => x == n,
  )

const allNotes: Notes[] = []
export const notestore = persisted("notestore", allNotes)
// notestore.set(allNotes)
const _note_del_queue: Notess = []
const note_del_queue = persisted("note_del_queue", _note_del_queue)

export class NoteSync {
  sb: SupabaseClient
  notestore: Writable<Notes[]>
  user_id: string | undefined
  note_del_queue: Writable<Notess>
  stuMap: STUMap
  constructor(sb: SupabaseClient, user_id: string | undefined) {
    this.sb = sb
    this.notestore = notestore
    this.stuMap = {}
    this.user_id = user_id
    this.note_del_queue = note_del_queue
  }
  inited = () => this.user_id !== undefined
  panel(id: number) {
    return derived(
      this.notestore,
      A.filter((n) => n.source_id == id),
    )
  }
  alltags = () => derived(this.notestore, (ns) => A.uniq(S.Eq)(ns.flatMap((n) => n.tags || [])))
  refresh_sources = async () =>
    this.user_id !== undefined
      ? (this.stuMap = await getTitlesUrls(this.sb)(this.stuMap, this.user_id))
      : console.log("what?")

  refresh_notes = async (id: O.Option<number> = O.none): Promise<PatchTup> =>
    this.user_id !== undefined
      ? await getNotes(this.sb, id, this.user_id).then((nns) =>
          updateStore(this.notestore)((s) => s.filter((n) => eqIfSome(n.id)(id)).concat(nns)),
        )
      : { patches: [], inverse: [] }

  get_groups = (transform: (x: NoteEx) => NoteEx & { priority: number }) =>
    derived(this.notestore, (ns) =>
      pipe(
        ns.map((n) => ({ ...n, sources: fillInTitleUrl(this.stuMap[n.source_id]) })),
        A.map(transform), // potentially can add filter here already actually
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
  // mdSource: O.Option<{ title: string; url: string }>
  addit = async (note: Notes) => {
    const { patches, inverse } = updateStore(this.notestore)((x) => {
      x.push(note)
    })
    await this.sb
      .from("notes")
      .insert(note)
      .then(logIfError)
      .then(ifErr(() => updateStore(this.notestore)(applyPatches(inverse))))
    // .then(ifErr)  savedelete
  }

  deleteit = (note: Notes) => {
    const { patches, inverse } = updateStore(this.notestore)((ns) => ns.filter((n) => n.id != note.id))
    this.sb
      .from("notes")
      .delete()
      .eq("id", note.id)
      .then(logIfError)
      .then(ifErr(() => updateStore(this.notestore)(applyPatches(inverse))))
  }

  tagUpdate = (note: Notes) => (tag: string, tags: string[]) => {
    const { patches, inverse } = updateStore(this.notestore)((ns) => {
      ns.filter((n) => n.id == note.id)[0].tags = tags
    })
    this.sb
      .from("notes")
      .update({ tags })
      .eq("id", note.id)
      .then(logIfError)
      .then(ifErr(() => updateStore(this.notestore)(applyPatches(inverse))))
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

  sub = (handlePayload: (payload: { new: Notes | {} }) => void) => {
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
        handlePayload,
      )
      .subscribe()
  }
}
