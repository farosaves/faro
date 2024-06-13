// note-sync with structura

// @ts-ignore
import { persisted } from "./persisted-store"
import type { Notes } from "../db/types"
import type { Note, SupabaseClient } from "../db/typeExtras"
import { derived, get, type Readable, type Writable } from "svelte/store"
import {
  applyPatches,
  neq,
  getUpdatedNotes,
  updateStore,
  invertMap,
  type Src,
  domainTitle,
  uuidv5,
  fillInTitleDomain,
  funLog,
  funWarn,
  sbLogger,
  maxDate,
} from "$lib/utils"
import { option as O, string as S, map as M, array as A } from "fp-ts"

import { flow, pipe } from "fp-ts/lib/function"
import { notesRowSchema } from "../db/schemas"
import { z } from "zod"
import { createMock, type PendingNote } from "../db/mock"
import * as devalue from "devalue"
import { getNotesOps, xxdoStacks, type PatchTup } from "./notes_ops"
import type { UUID } from "crypto"
import { ActionQueue } from "./queue"
import type { UnFreeze } from "structurajs"
import { toastNotify } from "$lib/stores"
// import * as lzString from "lz-string"

const validateNs = z.map(z.string(), notesRowSchema).parse
export type NoteStoreR = Readable<ReturnType<typeof validateNs>>
const allNotesR: ReturnType<typeof validateNs> = new Map()

type STUMap = Map<UUID, Src>
const validateSTUMap = (o: unknown) => z.map(z.string(), z.object({ title: z.string(), domain: z.string() })).parse(o) as STUMap
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()


export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

const storage = "indexedDB"
const noteStore = persisted<ReturnType<typeof validateNs>>("noteStore", allNotesR, { serializer: devalue, storage })
if (get(noteStore).values.length) // checking the length doesnt matter it's only needed to throttle for some reason
  noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))
const stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })
if (get(stuMapStore).values.length)
  stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))

const perm = { permissions: ["bookmarks"] }

export class NoteSync {
  sb: SupabaseClient
  noteStore: Writable<Map<string, Notes>>
  _user_id: UUID | undefined
  // note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  actionQueue: ActionQueue
  _checkOnline: () => Promise<true>
  DEBUG: boolean

  constructor(sb: SupabaseClient, user_id: string | undefined, checkOnline: () => Promise<true>) {
    this.sb = sb
    this.noteStore = noteStore
    // this block shall ensure local data gets overwritten on db schema changes
    this.stuMapStore = stuMapStore
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    this.actionQueue = new ActionQueue(this.sb, this.online, this.noteStore)

    this._user_id = user_id as UUID | undefined
    this._checkOnline = checkOnline

    this.DEBUG = import.meta.env.VITE_DEBUG || false
  }

  online = () => this._user_id !== undefined

  setUser_id = async (user_id: string | undefined) => {
    this._user_id = user_id as UUID | undefined
    const online = await this._checkOnline().catch(() => false)
    if (user_id === undefined || !online) return
    this._sub(user_id)
    this.noteStore.update(M.filter(n => n.user_id == user_id))
    this.refresh()
  }

  refresh = async () => {
    const warn = funWarn(sbLogger(this.sb))
    // const log = funLog2(sbLogger(this.sb))
    if (this._user_id === undefined) return warn("sync refresh")("undefined user")
    const latest = maxDate(Array.from(get(this.noteStore).values()).map(x => x.updated_at))
    // log("redresh time_latest")(latest)
    // log("#nns")
    await this._fetchNewNotes(latest)
    // Bookmarks sync here
    // log("#nss")
    await this._fetchNewSources()
    await this.actionQueue.goOnline(this._user_id as UUID)
  }


  _fetchNewSources = async () => {
    if (this._user_id == undefined) return 0
    const missingIds = pipe(Array.from(get(this.noteStore).values()),
      A.map(x => x.source_id),
      A.difference(S.Eq)(Array.from(get(this.stuMapStore).keys())),
    )
    const nss = (await this.sb.from("sources").select("*").in("id", missingIds)).data || []
    this.stuMapStore.update((ss) => {
      nss.forEach(s => ss.set(s.id as UUID, fillInTitleDomain(s)))
      return ss
    })
    return nss.length
  }

  _filter4Present = async (user_id: string, lastDate: string) => {
    const { count } = await this.sb.from("notes").select("", { count: "exact", head: true }).eq("user_id", user_id).lte("created_at", lastDate)
    // if as many notes in db as here don't do anything
    funLog("filter4Present")([count, get(this.noteStore).size])
    if ((count || 0) >= get(this.noteStore).size) return
    const { data } = await this.sb.from("notes").select("id").eq("user_id", user_id).lte("created_at", lastDate)
    funLog("filter4Present")(data)
    const presentIds = new Set((data || []).map(x => x.id))
    this.noteStore.update(M.filter(n => presentIds.has(n.id)))
  }

  _fetchNewNotes = async (latestTs: string) => {
    if (this._user_id == undefined) return 0
    await this._filter4Present(this._user_id, latestTs)
    const nns = await getUpdatedNotes(this.sb, this._user_id, latestTs)
    this.noteStore.update((ns) => {
      nns.forEach(nn => ns.set(nn.id, nn))
      return ns
    })
    return nns.length
  }


  getsetSource_id = async (src: Src) => {
    const local = this.getSource_id(src)
    if (O.isSome(local)) return local.value
    const id = uuidv5(domainTitle(src))
    this.stuMapStore.update(M.upsertAt<UUID>(S.Eq)(id, src))
    await this.actionQueue.actSrc({ ...src, id })
    return id
  }

  getSource_id = flow(domainTitle, n => get(this.invStuMapStore).get(n), O.fromNullable)

  newNote = async (note: PendingNote & { tags: string[] }, src: Src) => {
    funLog("newNote")(src)
    const source_id = await this.getsetSource_id(src)
    const n = { ...createMock(), ...note, source_id }
    await this.updateAct((ns) => {
      ns.set(n.id, n)
    })
    return n
  }

  _xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    updateStore(this.noteStore)(applyPatches(inverse)) // ! redo by 'default'
    this.actionQueue.act(this._user_id)(pTInverted)
    return pTInverted
  }

  undo = () => this.xxdoStacks.update(({ undo, redo }) => {
    const pT = undo.pop()
    console.log("undo", pT)
    if (!pT) return ({ undo, redo })
    toastNotify("Undo")
    return ({ undo, redo: [...redo, this._xxdo(pT)] })
  })

  redo = () => this.xxdoStacks.update(({ undo, redo }) => {
    const pT = redo.pop()
    console.log("redo", pT)
    if (!pT) return ({ undo, redo })
    toastNotify("Redo")
    return ({ redo, undo: [...undo, this._xxdo(pT)] })
  })

  stackNAct = async (patchTup: PatchTup) => {
    this.xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
    await this.actionQueue.act(this._user_id)(patchTup)
    // Bookmarks update here
    if (await chrome.permissions.contains(perm)) // chrome.permissions.request(perm)
      getNotesOps(patchTup.patches, get(this.noteStore))
  }

  updateAct = async (up: (arg: UnFreeze<Map<string, Notes>>) => void | Map<string, Notes>) =>
    this.stackNAct(updateStore(this.noteStore)(up))

  deleteit = async (noteId: string) =>
    this.updateAct((ns) => {
      ns.delete(noteId)
    })

  updateNote = async (note: Notes) =>
    this.updateAct((ns) => {
      ns.set(note.id, note)
    })

  tagChange = (noteId: string) => async (tags: string[]) =>
    this.updateAct((ns) => {
      ns.get(noteId)!.tags = tags
    })

  tagUpdate = async (oldTag: string, newTag: O.Option<string>) =>
    this.updateAct((ns) => {
      ns.forEach((n) => {
        const i = n.tags.indexOf(oldTag)
        if (~i)
          if (O.isSome(newTag))
            n.tags[i] = newTag.value
          else n.tags = n.tags.filter(neq(oldTag))
      })
    })

  changePrioritised = (noteId: string) => async (prioritised: number) =>
    this.updateAct((ns) => {
      ns.get(noteId)!.prioritised = prioritised
    })

  _sub = (user_id: string) => {
    this.sb
      .channel("notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user_id}`,
        },
        (payload: { new: Note | object }) => {
          if ("id" in payload.new) {
            const nn = payload.new
            updateStore(this.noteStore)((ns) => {
              ns.set(nn.id, nn)
            })
            if (!(get(this.stuMapStore).has(nn.source_id)))
              this._fetchNewSources()
            // const a = R.lookup(nn.source_id.toString())(get(this.stuMapStore))
          } else this._filter4Present(user_id, new Date().toISOString())
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
