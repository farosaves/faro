// note-sync with structura

// @ts-ignore
import { persisted } from "./persisted"
import type { InsertNotes, Notes } from "../db/types"
import type { NoteEx, Notess, SourceData, SupabaseClient } from "../db/typeExtras"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import {
  applyPatches,
  neq,
  fillInTitleUrl, // todo? lol
  filterSort,
  getNotes,
  ifErr,
  ifNErr,
  logIfError,
  unwrapTo,
  updateStore,
  browser,
} from "$lib/utils"
import { option as O, record as R, string as S, array as A, nonEmptyArray as NA } from "fp-ts"
import { flip, flow, identity, pipe } from "fp-ts/lib/function"
import { notesRowSchema } from "../db/schemas"
import { z } from "zod"
import { createMock } from "../db/mock"
import * as devalue from "devalue"
import { getNotesOps, xxdoStacks, type PatchTup } from "./xxdo"
// import * as lzString from "lz-string"

const validateNs = z.record(z.string(), notesRowSchema).parse
const allNotesR: ReturnType<typeof validateNs> = {}

// browser() && (localStorage.getItem("notestore") == "{}") && localStorage.setItem("notestore", "") // ! hack
export const noteStore = persisted("notestore", allNotesR, { serializer: devalue })
console.log(devalue.stringify(get(noteStore)).length)
// console.log(devalue.stringify(pipe(get(noteStore), R.map(x=>x.))).length)
// this block shall ensure local data gets overwritten on db schema changes
noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))

const validateSTUMap = z.record(z.string(), z.object({ title: z.string(), url: z.string() })).parse
type STUMap = ReturnType<typeof validateSTUMap>
const stuMap: STUMap = {}
const stuMapStore = persisted("stuMapStore", stuMap)
// prettier-ignore
stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))
// stuMapStore.set(stuMap)  // need to add it when changing dashboard/+page.server.ts

const defTransform = (n: NoteEx) => ({ ...n, priority: Date.parse(n.created_at) })
const transformStore = writable(defTransform)

// each patch may need validation if persisted..

const __f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof __f>
const applyTransform = ([ns, transform]: [NoteEx[], typeof defTransform]) =>
  pipe(
    ns,
    A.map(transform),
    A.filter(n => n.priority > 0),
    NA.groupBy(n => n.sources.title),
    R.toArray<string, (NoteEx & { priority: number })[]>,
    filterSort(([st, nss]) => pipe(nss.map(x => x.prioritised + 1000), A.reduce(0, Math.max),),  // !hacky + 1000
      ([st, nss]) => pipe(nss.map(x => x.priority), A.reduce(0, Math.max),)
    ),
  )

export class NoteSync {
  sb: SupabaseClient
  noteStore: Writable<Record<string, Notes>>
  noteArr: Readable<NoteEx[]>
  private user_id: string | undefined
  // note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  alltags: Readable<string[]>
  transformStore: Writable<(x: NoteEx) => NoteEx & { priority: number }>
  groupStore: Readable<ReturnType<typeof applyTransform>>

  constructor(sb: SupabaseClient, user_id: string | undefined) {
    this.sb = sb
    this.noteStore = noteStore
    this.stuMapStore = stuMapStore
    this.user_id = user_id
    // this.note_del_queue = note_del_queue
    this.noteArr = derived([this.noteStore, this.stuMapStore], ([n, s]) => {
      const vals = Object.values(n)
      return vals.map(n => ({ ...n, sources: fillInTitleUrl(s[n.source_id]), searchArt: O.none }))
    })
    this.alltags = derived(this.noteArr, ns => A.uniq(S.Eq)(ns.flatMap(n => n.tags || [])))
    this.transformStore = transformStore
    // this.nq = this.sb.from("notes")
    this.groupStore = derived([this.noteArr, this.transformStore], applyTransform)
  }

  inited = () => this.user_id !== undefined

  setUid = (user_id: string) => {
    this.user_id = user_id
    this.noteStore.update(R.filter(n => n.user_id == user_id))
  }

  refresh_sources = async () =>
    this.user_id !== undefined
    && this.stuMapStore.update(
      unwrapTo(
        pipe(
          (await this.sb.from("sources").select("*, notes (user_id)").eq("notes.user_id", this.user_id)).data,
          O.fromNullable,
          O.map(data => Object.fromEntries(data.map(n => [n.id, fillInTitleUrl(n)]))),
        ),
      ),
    )

  update_source = async (id: string, { sources }: SourceData) =>
    this.stuMapStore.update(R.upsertAt(id, sources))

  reset_transform = () => this.transformStore.set(defTransform)

  refresh_notes = async (id: O.Option<string> = O.none) =>
    this.user_id !== undefined
    && (await getNotes(this.sb, id, this.user_id).then(nns =>
      this.noteStore.set(Object.fromEntries(nns.map(n => [n.id, n]))),
    ))

  action
    = <T extends PromiseLike<{ error: any }>>(f: (a: NQ) => T) =>
      (patchTup: PatchTup, userAction = true) =>  // userAction distinguishes between xxdo (which doesnt reset redo stack) and action which does
        f(this.sb.from("notes"))  // note that the stacks on failed update from xxdo don't get updated properly yet..
          .then(logIfError)
          .then((e) => {
            console.log(patchTup)
            return e
          })
          .then(ifErr(() => updateStore(this.noteStore)(applyPatches(patchTup.inverse))))
          .then(
            ifNErr(() => {
              if (userAction) {
                xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
              }
            }),
          )

  act = (patchTup: PatchTup, userAction: boolean) => {
    // maps the operation with patchTup.patches to db update
    const notesOps = getNotesOps(patchTup.patches, get(this.noteStore))
    console.log("notesOps: ", notesOps)
    if (A.uniq(S.Eq)(notesOps.map(x => x.op)).length > 1) throw new Error("nore than 1 operation in xxdo")
    const op = notesOps.map(x => x.op)[0]
    if (op == "upsert")
      this.action(x => x.upsert(notesOps.map(on => on.note)))(patchTup, userAction)
    if (op == "delete")
      this.action(x => x.delete().in("id", notesOps.map(on => on.note.id)))(patchTup, userAction)
  }


  xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    console.log("patches:", patchTup)
    updateStore(this.noteStore)(applyPatches(inverse))  // ! redo by 'default'
    this.act(pTInverted, false)
    return pTInverted
  }

  // undo = () => this.xxdo(undo_stack, redo_stack)  // can still refactor below but not sure if cleaner
  undo = () => xxdoStacks.update(({ undo, redo }) => {
    const pT = undo.pop()
    console.log("undo", pT)
    if (!pT) return ({ undo, redo })
    return ({ undo, redo: [...redo, this.xxdo(pT)] })
  })

  redo = () => xxdoStacks.update(({ undo, redo }) => {
    const pT = redo.pop()
    console.log("redo", pT)
    if (!pT) return ({ undo, redo })
    return ({ redo, undo: [...undo, this.xxdo(pT)] })
  })

  add = async (note: InsertNotes, source_id: string) => {
    const n = { ...createMock(), note }
  }

  deleteit = async (note: Notes) => {
    const patchTup = updateStore(this.noteStore)(ns => {
      delete ns[note.id]
    })
    await this.action(x => x.delete().eq("id", note.id))(patchTup)
  }

  tagChange = (note: Notes) => async (tag: string, tags: string[]) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      Object.values(ns).filter(n => n.id == note.id)[0].tags = tags
    })
    this.action(x => x.update({ tags }).eq("id", note.id))(patchTup)
  }

  tagUpdate = async (oldTag: string, newTag: O.Option<string>) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      Object.values(ns).forEach(n => {
        const i = n.tags.indexOf(oldTag)
        if (~i)
          if (O.isSome(newTag))
            n.tags[i] = newTag.value
          else n.tags = n.tags.filter(neq(oldTag))
      })
    })
    this.act(patchTup, true)
  }

  changePrioritised = (note: Notes) => async (prioritised: number) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      Object.values(ns).filter(n => n.id == note.id)[0].prioritised = prioritised
    })
    this.action(x => x.update({ prioritised }).eq("id", note.id))(patchTup)
  }

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
            updateStore(this.noteStore)((ns) => {
              ns[nn.id] = nn
            })
            // const a = R.lookup(nn.source_id.toString())(get(this.stuMapStore))
          } else this.refresh_notes()  // TODO: this is to run on deletions: but if I exectued deletion manually i could skip it
        },
      )
      .subscribe()
  }
}
