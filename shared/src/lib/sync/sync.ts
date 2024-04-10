// note-sync with structura

// @ts-ignore
import { persisted, type StorageType } from "./persisted-store"
import type { Notes } from "../db/types"
import type { Note, SupabaseClient } from "../db/typeExtras"
import { derived, get, type Readable, type Writable } from "svelte/store"
import {
  applyPatches,
  neq,
  fillInTitleUrl,
  getNotes,
  unwrapTo,
  updateStore,
  invertMap,
  type Src,
  domainTitle,
  chainN,
  uuidv5,
} from "$lib/utils"
import { option as O, string as S, map as M } from "fp-ts"

import { flow, pipe } from "fp-ts/lib/function"
import { notesRowSchema } from "../db/schemas"
import { z } from "zod"
import { createMock, type PendingNote } from "../db/mock"
import * as devalue from "devalue"
import { xxdoStacks, type PatchTup } from "./xxdo"
import type { UUID } from "crypto"
import { ActionQueue } from "./queue"
// import * as lzString from "lz-string"

const validateNs = z.map(z.string(), notesRowSchema).parse
export type NoteStoreR = Readable<ReturnType<typeof validateNs>>
const allNotesR: ReturnType<typeof validateNs> = new Map()

type STUMap = Map<UUID, Src>
const validateSTUMap = (o: unknown) => z.map(z.string(), z.object({ title: z.string(), url: z.string() })).parse(o) as STUMap
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()


export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

// another patch stack for queued actions - Either stumap- or note-store
// for note store patchtups I can just call act later
// for stumap store need an analogous act OR make inserts take note, domain, title lol

// so queued action stack is: notestore patchtup & Src ({domain, title})
// before uploading queued action stack i need to first refresh sources to make stumapstore synced

// so on offline add I get from invstumap store or add a temporary entry, but I don't keep that entry later
// on online ...

// type Action = PatchTup & { action: "patches" } | { src: Src, id: UUID, action: "source" }

export class NoteSync {
  sb: SupabaseClient
  noteStore: Writable<Map<string, Notes>>
  _user_id: UUID | undefined
  // note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  actionQueue: ActionQueue
  DEBUG: boolean

  constructor(sb: SupabaseClient, user_id: string | undefined, storage: StorageType = "local") {
    this.sb = sb
    this.noteStore = persisted<ReturnType<typeof validateNs>>("noteStore", allNotesR, { serializer: devalue, storage })
    // this block shall ensure local data gets overwritten on db schema changes
    this.noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))

    this.stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })
    this.stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), M.compact, invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    this.actionQueue = new ActionQueue(this.sb, this.online, this.noteStore)

    this._user_id = user_id as UUID | undefined // TODO: here

    this.DEBUG = import.meta.env.VITE_DEBUG || false
  }

  online = () => this._user_id !== undefined

  setUser_id = async (user_id: string | undefined) => {
    this._user_id = user_id as UUID | undefined // TODO: here
    if (user_id === undefined) return
    this.noteStore.update(M.filter(n => n.user_id == user_id))
    // do actions from queue
    await this.refresh_sources()
    await this.refresh_notes()
    await this.actionQueue.goOnline(user_id as UUID)
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


  getsetSource_id = async (src: Src) => {
    const local = this.getSource_id(src)
    if (O.isSome(local)) return local.value
    const newId = pipe(domainTitle(src), O.map(uuidv5))
    if (O.isNone(newId)) throw new Error("coudlnt create source id for source: " + JSON.stringify(src))
    const id = newId.value
    this.stuMapStore.update(M.upsertAt<UUID>(S.Eq)(id, src))
    await this.actionQueue.actSrc({ ...src, id })
    return id
  }

  // chainN(get(this.invStuMapStore).get), DOESNT WORK
  getSource_id = flow(domainTitle, chainN(n => get(this.invStuMapStore).get(n)))

  newNote = async (note: PendingNote, src: Src) => {
    const source_id = await this.getsetSource_id(src)
    const n = { ...createMock(), ...note, source_id }
    const patchTup: PatchTup = updateStore(this.noteStore)((map) => {
      map.set(n.id, n)
    })

    await this.act(patchTup, true)
    return n
  }

  _xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    console.log("patches:", patchTup)
    updateStore(this.noteStore)(applyPatches(inverse)) // ! redo by 'default'
    this.actionQueue.pushAction(this._user_id!)(pTInverted)
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

  act = async (patchTup: PatchTup, userAction = true) => {
    if (userAction) this.xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
    await this.actionQueue.act(this._user_id!)(patchTup)
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
