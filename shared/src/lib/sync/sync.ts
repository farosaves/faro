// note-sync with structura

// @ts-ignore
import { persisted, type StorageType } from "./persisted-store"
import type { InsertNotes, Notes } from "../db/types"
import type { Note, NoteEx, Notess, SourceData, SupabaseClient } from "../db/typeExtras"
import { derived, get, writable, type Readable, type Updater, type Writable } from "svelte/store"
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
  invertMap,
  type Src,
  domainTitle,
  chainN,
  funLog,
} from "$lib/utils"
import { option as O, record as R, string as S, array as A, nonEmptyArray as NA, map as M } from "fp-ts"
import { flip, flow, pipe } from "fp-ts/lib/function"
import { notesRowSchema } from "../db/schemas"
import { v5 as uuidv5 } from "uuid"
import { z } from "zod"
import { createMock, type PendingNote } from "../db/mock"
import * as devalue from "devalue"
import { getNotesOps, xxdoStacks, type PatchTup } from "./xxdo"
import { namespaceUuid } from "$lib"
import type { UUID } from "crypto"
import type { Patch } from "immer"
// import * as lzString from "lz-string"

const validateNs = z.map(z.string(), notesRowSchema).parse
export type NoteStoreR = Readable<ReturnType<typeof validateNs>>
const allNotesR: ReturnType<typeof validateNs> = new Map()

type STUMap = Map<UUID, Src>
const validateSTUMap = (o: unknown) => z.map(z.string(), z.object({ title: z.string(), url: z.string() })).parse(o) as STUMap
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()

const __f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof __f>

export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

// another patch stack for queued actions - Either stumap- or note-store
// for note store patchtups I can just call act later
// for stumap store need an analogous act OR make inserts take note, domain, title lol

// so queued action stack is: notestore patchtup & Src ({domain, title})
// before uploading queued action stack i need to first refresh sources to make stumapstore synced

// so on offline add I get from invstumap store or add a temporary entry, but I don't keep that entry later
// on online ...

export class NoteSync {
  sb: SupabaseClient
  noteStore: Writable<Map<string, Notes>>
  _user_id: string | undefined
  // note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  actionQueue: Writable<(PatchTup & { src: Src | undefined })[]>
  DEBUG: boolean

  constructor(sb: SupabaseClient, user_id: string | undefined, storage: StorageType = "local") {
    this.sb = sb
    this.noteStore = persisted<ReturnType<typeof validateNs>>("notestore", allNotesR, { serializer: devalue, storage })
    // this block shall ensure local data gets overwritten on db schema changes
    this.noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))

    this.stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })
    this.stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), M.compact, invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    this.actionQueue = writable([])

    this._user_id = user_id
    // this.note_del_queue = note_del_queue
    this.DEBUG = import.meta.env.DEBUG || false
  }

  online = () => this._user_id !== undefined

  setUser_id = async (user_id: string | undefined) => {
    this._user_id = user_id
    if (user_id === undefined) return
    this.noteStore.update(M.filter(n => n.user_id == user_id))
    // do actions from queue
    await this.refresh_sources()
    await this.refresh_notes()
    const actionQueue = get(this.actionQueue)
    // TODO: here not updating when I go back online
    for (const action of actionQueue) {
      console.log(action.patches, "action patches")
      await this.pushAction(action)
    }
  }

  refresh_sources = async () =>
    this._user_id !== undefined
    && this.stuMapStore.update(
      unwrapTo(
        pipe(
          (await this.sb.from("sources").select("*, notes (user_id)").eq("notes.user_id", this._user_id)).data,
          O.fromNullable,
          O.map(data => new Map(data.map(n => [n.id as UUID, fillInTitleUrl(n)]))),
        ),
      ),
    )

  // update_source = async (id: string, { sources }: SourceData) =>
  //   this.stuMapStore.update(M.upsertAt(S.Eq)(id, sources) as Updater<STUMap>)

  refresh_notes = async (id: O.Option<string> = O.none) =>
    this._user_id !== undefined
    && (await getNotes(this.sb, id, this._user_id).then((nns) => {
      // console.log(new Map(nns.map(n => [n.id, n])))
      this.noteStore.set(new Map(nns.map(n => [n.id, n])))
    }))


  pushAction = async (patchTup: PatchTup) => {
    console.log("puuushing")
    const _pushAction = <U, T extends PromiseLike<{ error: U }>>(f: (a: NQ) => T) =>
      (patchTup: PatchTup) => // userAction distinguishes between xxdo (which doesnt reset redo stack) and action which does
        f(this.sb.from("notes")) // note that the stacks on failed update from xxdo don't get updated properly yet..
          .then(logIfError("pushAction"))
          .then((e) => {
            console.log(patchTup)
            return e
          })
          .then(
            ifErr(() => updateStore(this.noteStore)(applyPatches(patchTup.inverse))))
    // maps the operation with patchTup.patches to db update
    if (this._user_id === undefined) throw new Error("tried pushing while not logged in")
    const notesOps = getNotesOps(patchTup.patches, get(this.noteStore))
    for (const { note } of notesOps)
      note.user_id = this._user_id

    console.log("notesOps: ", notesOps)
    if (A.uniq(S.Eq)(notesOps.map(x => x.op)).length > 1) throw new Error("nore than 1 operation in xxdo")

    const op = notesOps.map(x => x.op)[0]
    if (op == "upsert")
      await _pushAction(x => x.upsert(notesOps.map(on => on.note)))(patchTup)
    if (op == "delete")
      await _pushAction(x => x.delete().in("id", notesOps.map(on => on.note.id)))(patchTup)
  }

  act = (patchTup: PatchTup, userAction: boolean, src?: Src) => {
    if (userAction) this.xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
    if (this.online()) this.pushAction(patchTup)
    else this.actionQueue.update(A.append(({ ...patchTup, src })))
    console.log("AQ", get(this.actionQueue))
  }

  _xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    console.log("patches:", patchTup)
    updateStore(this.noteStore)(applyPatches(inverse)) // ! redo by 'default'
    this.pushAction(pTInverted)
    return pTInverted
  }

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

  getsetSource_id = (src: Src) => {
    const dt = domainTitle(src)
    const local = this.getSource_id(src)
    if (O.isSome(local)) return local
    const newId = pipe(dt, O.map(s => uuidv5(s, namespaceUuid) as UUID))
    pipe(newId, O.map(id => this.stuMapStore.update(M.upsertAt<UUID>(S.Eq)(id, src))))
    return newId
  }

  // chainN(get(this.invStuMapStore).get), DOESNT WORK
  getSource_id = flow(domainTitle, chainN(n => get(this.invStuMapStore).get(n)))

  newNote = async (note: PendingNote, src: Src) => {
    const source_idOpt = this.getsetSource_id(src)

    console.log("src id", this.getSource_id(src))
    if (O.isNone(source_idOpt)) throw new Error("probably not correct url..")
    const source_id = source_idOpt.value
    const n: Note = { ...createMock(), ...note, source_id }
    // funLog("noteStore")(get(this.noteStore))
    const patchTup: PatchTup = updateStore(this.noteStore)((map) => {
      map.set(n.id, n)
    })
    this.act(patchTup, true, src)
    setTimeout(() => console.log("src id later", this.getSource_id(src)), 1000)

    // const patchTup = updateStore(this.noteStore)((ns) => {
    //   ns.delete(n.id)
    // })
    // await this.action(x => x.delete().eq("id", n.id))(patchTup)
  }

  deleteit = async (noteId: string) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      ns.delete(noteId)
    })
    this.act(patchTup, true)
  }

  tagChange = (noteId: string) => async (tags: string[]) => {
    const patchTup = updateStore(this.noteStore)((ns) => {
      ns.get(noteId)!.tags = tags
    })
    this.act(patchTup, true)
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
    this.act(patchTup, true)
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
        (payload: { new: Note | object }) => {
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
