// note-sync with structura

// @ts-ignore
import { persisted, type StorageType } from "./persisted-store"
import type { InsertNotes, Notes } from "../db/types"
import type { NoteEx, Notess, SourceData, SupabaseClient } from "../db/typeExtras"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import {
  applyPatches,
  neq,
  fillInTitleUrl,
  getNotes,
  ifErr,
  ifNErr,
  logIfError,
  unwrapTo,
  updateStore,
} from "$lib/utils"
import { option as O, record as R, string as S, array as A, nonEmptyArray as NA, map as M } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import { notesRowSchema } from "../db/schemas"
import { z } from "zod"
import { createMock } from "../db/mock"
import * as devalue from "devalue"
import { getNotesOps, xxdoStacks, type PatchTup } from "./xxdo"
// import * as lzString from "lz-string"

const validateNs = z.map(z.string(), notesRowSchema).parse
export type NoteStoreR = Readable<ReturnType<typeof validateNs>>
const allNotesR: ReturnType<typeof validateNs> = new Map()

const validateSTUMap = z.map(z.string(), z.object({ title: z.string(), url: z.string() })).parse
type STUMap = ReturnType<typeof validateSTUMap>
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()

const __f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof __f>

export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

export class NoteSync {
  sb: SupabaseClient
  noteStore: Writable<Map<string, Notes>>
  _user_id: string | undefined
  // note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  DEBUG: boolean

  constructor(sb: SupabaseClient, user_id: string | undefined, storage: StorageType = "local") {
    this.sb = sb
    this.noteStore = persisted<ReturnType<typeof validateNs>>("notestore", allNotesR, { serializer: devalue, storage })
    // this block shall ensure local data gets overwritten on db schema changes
    this.noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))

    this.stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })
    this.stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))

    this.xxdoStacks = xxdoStacks(storage)

    this._user_id = user_id
    // this.note_del_queue = note_del_queue
    this.DEBUG = import.meta.env.DEBUG || false
  }

  inited = () => this._user_id !== undefined

  setUser_id = (user_id: string | undefined) => {
    this._user_id = user_id
    if (user_id !== undefined)
      this.noteStore.update(M.filter(n => n.user_id == user_id))
  }

  refresh_sources = async () =>
    this._user_id !== undefined
    && this.stuMapStore.update(
      unwrapTo(
        pipe(
          (await this.sb.from("sources").select("*, notes (user_id)").eq("notes.user_id", this._user_id)).data,
          O.fromNullable,
          O.map(data => new Map(data.map(n => [n.id, fillInTitleUrl(n)]))),
        ),
      ),
    )

  update_source = async (id: string, { sources }: SourceData) =>
    this.stuMapStore.update(M.upsertAt(S.Eq)(id, sources))

  refresh_notes = async (id: O.Option<string> = O.none) =>
    this._user_id !== undefined
    && (await getNotes(this.sb, id, this._user_id).then((nns) => {
      // console.log(new Map(nns.map(n => [n.id, n])))
      this.noteStore.set(new Map(nns.map(n => [n.id, n])))
    }))

  action = <U, T extends PromiseLike<{ error: U }>>(f: (a: NQ) => T) =>
    (patchTup: PatchTup, userAction = true) => // userAction distinguishes between xxdo (which doesnt reset redo stack) and action which does
      f(this.sb.from("notes")) // note that the stacks on failed update from xxdo don't get updated properly yet..
        .then(logIfError)
        .then((e) => {
          console.log(patchTup)
          return e
        })
        .then(ifErr(() => updateStore(this.noteStore)(applyPatches(patchTup.inverse))))
        .then(
          ifNErr(() => {
            if (userAction) {
              this.xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
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

  _xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    console.log("patches:", patchTup)
    updateStore(this.noteStore)(applyPatches(inverse)) // ! redo by 'default'
    this.act(pTInverted, false)
    return pTInverted
  }

  // undo = () => this.xxdo(undo_stack, redo_stack)  // can still refactor below but not sure if cleaner
  undo = () => this.xxdoStacks.update(({ undo, redo }) => {
    const pT = undo.pop()
    console.log("undo", pT)
    if (!pT) return ({ undo, redo })
    return ({ undo, redo: [...redo, this._xxdo(pT)] })
  })

  redo = () => this.xxdoStacks.update(({ undo, redo }) => {
    const pT = redo.pop()
    console.log("redo", pT)
    if (!pT) return ({ undo, redo })
    return ({ redo, undo: [...undo, this._xxdo(pT)] })
  })

  add = async (note: InsertNotes, source_id: string) => {
    const n = { ...createMock(), note }
  }

  deleteit = async (noteId: string) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      ns.delete(noteId)
    })
    await this.action(x => x.delete().eq("id", noteId))(patchTup)
  }

  tagChange = (noteId: string) => async (tags: string[]) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      ns.get(noteId)!.tags = tags
    })
    this.action(x => x.update({ tags }).eq("id", noteId))(patchTup)
  }

  tagUpdate = async (oldTag: string, newTag: O.Option<string>) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      ns.forEach((n) => {
        const i = n.tags.indexOf(oldTag)
        if (~i)
          if (O.isSome(newTag))
            n.tags[i] = newTag.value
          else n.tags = n.tags.filter(neq(oldTag))
      })
    })
    this.act(patchTup, true)
  }

  changePrioritised = (noteId: string) => async (prioritised: number) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      ns.get(noteId)!.prioritised = prioritised
    })
    this.action(x => x.update({ prioritised }).eq("id", noteId))(patchTup)
  }

  sub = () => {
    console.log("debug", this.DEBUG)
    this.sb
      .channel("notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${this._user_id}`,
        },
        (payload: { new: Notes | object }) => {
          if ("id" in payload.new) {
            const nn = payload.new
            updateStore(this.noteStore)((ns) => {
              ns.set(nn.id, nn)
            })
            if (!(get(this.stuMapStore).has(nn.source_id)))
              this.refresh_sources()
            // const a = R.lookup(nn.source_id.toString())(get(this.stuMapStore))
          } else this.refresh_notes() // TODO: this is to run on deletions: but if I just exectued deletion manually i could skip it
        },
      )
      .subscribe((status) => {
        this.DEBUG && console.log("status change- ", status)
        if (status !== "SUBSCRIBED") {
          // this.refresh_sources().then(() => this.refresh_notes())
        }
      })
  }
}
