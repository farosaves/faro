// note-sync with structura

// @ts-ignore
import { persisted } from "./persisted-store"
import type { Note } from "./note"
import { derived, type Readable, type Writable } from "svelte/store"
import { invertMap, domainTitle, neq, escapeRegExp } from "$lib/utils"
import { option as O, map as M } from "fp-ts"
import { flow, pipe } from "fp-ts/lib/function"
import * as devalue from "devalue"
import { xxdoStacks, type PatchTup } from "./notes_ops"
import type { UUID } from "crypto"
import type { UnFreeze } from "structurajs"
import { activeLoadsStore, toastNotify } from "$lib/stores"
import { applyPatches, updateStore } from "./utils"
// import * as lzString from "lz-string"

type NoteMapR = Map<string, Note>
export type NoteStoreR = Readable<NoteMapR>
const allNotesR: NoteMapR = new Map()

export type STUMap = Map<UUID, Note>
// const validateSTUMap = (o: unknown) => z.map(z.string(), z.object({ title: z.string(), domain: z.string() })).parse(o) as STUMap
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()


export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

const storage = "indexedDB"
const noteStore = persisted<NoteMapR>("noteStore", allNotesR, { serializer: devalue, storage })
// the following was checking if old data was congruent with schema updates - not needed anymore
// if (get(noteStore).values.length) // checking the length doesnt matter it's only needed to throttle for some reason
//   noteStore.update(ns => pipe(() => validateNs(ns), O.tryCatch, O.getOrElse(() => allNotesR)))
const stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })
// if (get(stuMapStore).values.length)
//   stuMapStore.update(ns => pipe(() => validateSTUMap(ns), O.tryCatch, O.getOrElse(() => stuMap)))

// const perm = { permissions: ["bookmarks"] }

export class NoteSync {
  noteStore: Writable<NoteMapR>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  DEBUG: boolean

  constructor() {
    this.noteStore = noteStore
    this.stuMapStore = stuMapStore
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    this.DEBUG = import.meta.env.VITE_DEBUG || false
  }


  loadFromBookmarks = async () => {
    // const warn = funWarn(sbLogger(this.sb))
    activeLoadsStore.update(x => x + 1)
    // await this._fetchNewNotes()
    // await this._fetchNewSources()
    // await this.actionQueue.goOnline(this._user_id as UUID)
    activeLoadsStore.update(x => x - 1)
  }

  hardReset = () => {
    this.noteStore.set(new Map())
    this.stuMapStore.set(new Map())
    // TODO: here load from current bookmarks
    // this.actionQueue.queueStore.set([])
    return this.loadFromBookmarks()
  }


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

  updateNote = async (note: Note) =>
    this.updateAct((ns) => {
      ns.set(note.id, note)
    })

  tagChange = (noteId: string) => async (tags: string[]) =>
    this.updateAct((ns) => {
      ns.get(noteId)!.tags = tags
    })

  tagUpdate = async (oldTag: string, newTag: O.Option<string>, allTags: string[]) => {
    const updateTag = (oldTag: string, newTag: O.Option<string>) => (n: Note) => {
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
    // TODO: it should just listen to bookmarks.onCreated
  //   this.sb
  //     .channel("notes")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "notes",
  //         filter: `user_id=eq.${user_id}`,
  //       },
  //       (payload: { new: Note | object }) => {
  //         if ("id" in payload.new) {
  //           const nn = payload.new
  //           updateStore(this.noteStore)((ns) => {
  //             ns.set(nn.id, nn)
  //           })
  //           if (!(get(this.stuMapStore).has(nn.source_id)))
  //             this._fetchNewSources()
  //           // const a = R.lookup(nn.source_id.toString())(get(this.stuMapStore))
  //         } else this._filter4Present(user_id, new Date().toISOString())// .then(() => funLog("_sub")("_filter4Present"))
  //       },
  //     )
  //     .subscribe((status) => {
  //       this.DEBUG && console.log("status change- ", status)
  //       if (status !== "SUBSCRIBED") {
  //         // this.refresh_sources().then(() => this.refresh_notes())
  //       }
  //     })
  }
}
