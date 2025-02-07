// note-sync with structura

// @ts-ignore
import { persisted } from "./persisted-store"
import type { Note } from "../note"
import { derived, get, type Readable, type Writable } from "svelte/store"
import { type Src, uuidv5, funLog, funWarn, sbLogger, sleep, logIfError, invertMap, domainTitle, neq, escapeRegExp, fillInTitleDomain } from "$lib/utils"
import { option as O, string as S, map as M, array as A } from "fp-ts"

import { flow, pipe } from "fp-ts/lib/function"
import * as devalue from "devalue"
import { xxdoStacks, type PatchTup } from "./notes_ops"
import type { UUID } from "crypto"
import { ActionQueue } from "./queue"
import type { UnFreeze } from "structurajs"
import { activeLoadsStore, requestedSync, toastNotify } from "$lib/stores"
import { noop } from "rxjs"
import { applyPatches, getUpdatedNotes, maxDate, updateStore } from "./utils"
// import * as lzString from "lz-string"

type NoteMapR = Map<string, Note>
export type NoteStoreR = Readable<NoteMapR>
const allNotesR: NoteMapR = new Map()

export type STUMap = Map<UUID, Src>
const validateSTUMap = (o: unknown) => z.map(z.string(), z.object({ title: z.string(), domain: z.string() })).parse(o) as STUMap
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()


export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

const storage = "indexedDB"
const noteStore = persisted<NoteMapR>("noteStore", allNotesR, { serializer: devalue, storage })
// the following was checking if old data was congruent with schema updates - not needed anymore
// if (get(noteStore).values.length) // checking the length doesnt matter it's only needed to throttle for some reason
//   noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))
const stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })
if (get(stuMapStore).values.length)
  stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))

// const perm = { permissions: ["bookmarks"] }

export class NoteSync {
  noteStore: Writable<NoteMapR>
  _user_id: UUID | undefined
  // note_del_queue: Writable<Notess>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  // actionQueue: ActionQueue
  _checkOnline: () => Promise<boolean>
  DEBUG: boolean

  constructor(user_id: string | undefined, checkOnline: () => Promise<boolean>) {
    this.noteStore = noteStore
    // this block shall ensure local data gets overwritten on db schema changes
    this.stuMapStore = stuMapStore
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    // this.actionQueue = new ActionQueue(this.sb, this.online, this.noteStore, noop)
    // u => this.stuMapStore.update((m) => { // superhacky
    //   m.delete(u)
    //   return m
    // })

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
    await this.refresh()
    this.noteStore.update(M.filter(n => n.user_id == user_id))
  }

  refresh = async () => {
    // const warn = funWarn(sbLogger(this.sb))
    if (this._user_id === undefined) return funLog("sync refresh")("undefined user")
    activeLoadsStore.update(x => x + 1)
    // await this._fetchNewNotes()
    // await this._fetchNewSources()
    // await this.actionQueue.goOnline(this._user_id as UUID)
    activeLoadsStore.update(x => x - 1)
    // Bookmarks sync here
    if (get(requestedSync)) 3
  }

  hardReset = () => {
    this.noteStore.set(new Map())
    this.stuMapStore.set(new Map())
    // TODO: here load from current bookmarks
    // this.actionQueue.queueStore.set([])
    return this.refresh()
  }


  // _fetchNewSources = async (): Promise<true | undefined> => {
  //   if (this._user_id == undefined) return
  //   const LIMIT = 100 // # at a time
  //   const missingIds = pipe(Array.from(get(this.noteStore).values()),
  //     A.map(x => x.source_id),
  //     A.difference(S.Eq)(Array.from(get(this.stuMapStore).keys())),
  //     A.uniq(S.Eq),
  //     A.takeLeft(LIMIT),
  //   )
  //   const nss = (await this.sb.from("sources").select("*").in("id", missingIds).then(logIfError("nss @ _fetchNewSources"))).data || []
  //   this.stuMapStore.update((ss) => {
  //     nss.forEach(s => ss.set(s.id as UUID, fillInTitleDomain(s)))
  //     return ss
  //   })
  //   funLog("stuMapStore @ _fetchNewSources")(get(this.stuMapStore))
  //   return nss.length < LIMIT || this._fetchNewSources()
  // }

  // _filter4Present = async (user_id: string, lastDate: string) => {
  //   const { count } = await this.sb.from("notes").select("", { count: "exact", head: true }).eq("user_id", user_id).lte("created_at", lastDate)

  //   const nLocal = pipe(get(this.noteStore), M.filter(n => n.created_at.localeCompare(lastDate) <= 0), M.size)
  //   const nServer = count || 0
  //   funLog("filter4Present")([get(this.noteStore).size, nLocal, count, lastDate])
  //   // if as many notes in db as here don't do anything
  //   if (nLocal == nServer) return
  //   // more in the db - reset
  //   if (nLocal < nServer) return this.noteStore.set(new Map())
  //   // if fewer in db delete something here
  //   const { data } = await this.sb.from("notes").select("id").eq("user_id", user_id).lte("created_at", lastDate)
  //   funLog("filter4Present")(data)
  //   const presentIds = new Set((data || []).map(x => x.id))
  //   this.noteStore.update(M.filter(n => presentIds.has(n.id)))
  // }

  // _fetchNewNotes = async (ts?: string): Promise<true | undefined> => {
  //   if (this._user_id == undefined) return
  //   const _latestTs = ts || maxDate(Array.from(get(this.noteStore).values()).map(x => x.updated_at))
  //   // funLog("_fetchNewNotes")([_latestTs, ts, Array.from(get(this.noteStore).values()).map(x => x.updated_at)])
  //   await this._filter4Present(this._user_id, _latestTs)
  //   const latestTs = ts || maxDate(Array.from(get(this.noteStore).values()).map(x => x.updated_at))
  //   const nns = await getUpdatedNotes(this.sb, this._user_id, latestTs)
  //   this.noteStore.update((ns) => {
  //     nns.forEach(nn => ns.set(nn.id, nn))
  //     return ns
  //   })
  //   funLog("nns.length")(nns.length)
  //   await sleep(1)
  //   return nns.length < 10000 || this._fetchNewNotes(ts)
  // }


  // getsetSource_id = async (src: Src) => {
  //   const local = this.getSource_id(src)
  //   funLog("localSrc_id")(local)
  //   if (O.isSome(local)) return local.value
  //   const id = uuidv5(domainTitle(src))
  //   this.stuMapStore.update(M.upsertAt<UUID>(S.Eq)(id, src))
  //   await this.actionQueue.actSrc({ ...src, id }) // this IS blocking local update if online but high latency, but prevents flashing
  //   return id
  // }

  // getSource_id = flow(domainTitle, n => get(this.invStuMapStore).get(n), O.fromNullable)

  newNote = async (note: Note) => {
    // TODO: create bookmark
    // funLog("newNote")(src)
    // const source_id = await this.getsetSource_id(src)
    // const n = { ...createMock(), ...note, source_id }
    // funLog("newNote note")(n)
    // await this.updateAct((ns) => {
    //   ns.set(n.id, n)
    // })
    // return n
  }

  _xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    updateStore(this.noteStore)(applyPatches(inverse)) // ! redo by 'default'
    // this.actionQueue.act(this._user_id)(pTInverted)
    return pTInverted
  }

  undo = () => this.xxdoStacks.update(({ undo, redo }) => {
    const pT = undo.pop()
    console.log("undo", pT)
    if (!pT) return ({ undo, redo })
    toastNotify("Undo")
    redo.push(this._xxdo(pT))
    return ({ undo, redo })
  })

  redo = () => this.xxdoStacks.update(({ undo, redo }) => {
    const pT = redo.pop()
    console.log("redo", pT)
    if (!pT) return ({ undo, redo })
    toastNotify("Redo")
    undo.push(this._xxdo(pT))
    return ({ redo, undo })
  })

  stackNAct = async (patchTup: PatchTup) => {
    this.xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
    // await this.actionQueue.act(this._user_id)(patchTup)
    // Bookmarks update here?
    // if (await chrome.permissions.contains(perm)) syncBookmarks()
    // getNotesOps(patchTup.patches, get(this.noteStore))
  }

  updateAct = async (up: (arg: UnFreeze<Map<string, Note>>) => void | Map<string, Note>) =>
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

  tagUpdate = async (oldTag: string, newTag: O.Option<string>, allTags: string[]) => {
    const updateTag = (oldTag: string, newTag: O.Option<string>) => (n: Notes) => {
      const i = n.tags.indexOf(oldTag)
      if (~i)
        if (O.isSome(newTag))
          n.tags[i] = newTag.value
        else n.tags = n.tags.filter(neq(oldTag))
    }
    // check if old is a prefix of this tag
    const regex = RegExp(`^${escapeRegExp(oldTag)}(?=/|$)`)
    this.updateAct((ns) => {
      allTags.filter(x => regex.test(x)).forEach(tag =>
        ns.forEach(
          updateTag(tag, pipe(newTag, O.map(s => tag.replace(regex, s))))))
    })
  }


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
          } else this._filter4Present(user_id, new Date().toISOString())// .then(() => funLog("_sub")("_filter4Present"))
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
