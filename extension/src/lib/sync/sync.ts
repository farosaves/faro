// note-sync with structura

// @ts-ignore
import { persisted } from "./persisted-store"
import type { Note } from "./note"
import { derived, get, type Readable, type Writable } from "svelte/store"
import { invertMap, domainTitle, neq, escapeRegExp } from "$lib/utils"
import { option as O, map as M } from "fp-ts"
import { flow, pipe } from "fp-ts/lib/function"
import * as devalue from "devalue"
import { xxdoStacks, type PatchTup } from "./notes_ops"
import type { UUID } from "crypto"
import type { UnFreeze } from "structurajs"
import { activeLoadsStore, toastNotify } from "$lib/stores"
import { applyPatches, updateStore } from "./utils"
import { stubBookmarkStore, type BookmarkStore, type NewNoteInput } from "$lib/bookmarks/store"
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
  store: BookmarkStore
  noteStore: Writable<NoteMapR>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  DEBUG: boolean

  constructor(store: BookmarkStore = stubBookmarkStore) {
    this.store = store
    this.noteStore = noteStore
    this.stuMapStore = stuMapStore
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    this.DEBUG = import.meta.env.VITE_DEBUG || false
  }


  loadFromBookmarks = async () => {
    activeLoadsStore.update(x => x + 1)
    try {
      const notes = await this.store.load()
      this.noteStore.set(new Map(notes.map(n => [n.id, n])))
    } finally {
      activeLoadsStore.update(x => x - 1)
    }
  }

  hardReset = () => {
    this.noteStore.set(new Map())
    this.stuMapStore.set(new Map())
    return this.loadFromBookmarks()
  }


  newNote = async (input: NewNoteInput) => {
    const n = await this.store.newNote(input)
    if (n) updateStore(this.noteStore)((ns) => {
      ns.set(n.id, n)
    })
    return n
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
    // TODO(WS-C): write every patch (incl. undo/redo, tagUpdate) through to this.store
  }

  updateAct = async (up: (arg: UnFreeze<Map<string, Note>>) => void | Map<string, Note>) =>
    this.stackNAct(updateStore(this.noteStore)(up))

  _writeThrough = (noteId: string) => {
    const n = get(this.noteStore).get(noteId)
    return n ? this.store.update(n) : Promise.resolve()
  }

  deleteit = async (noteId: string) => {
    await this.updateAct((ns) => {
      ns.delete(noteId)
    })
    await this.store.delete(noteId)
  }

  updateNote = async (note: Note) => {
    await this.updateAct((ns) => {
      ns.set(note.id, note)
    })
    await this._writeThrough(note.id)
  }

  tagChange = (noteId: string) => async (tags: string[]) => {
    await this.updateAct((ns) => {
      ns.get(noteId)!.tags = tags
    })
    await this._writeThrough(noteId)
  }

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


  changePrioritised = (noteId: string) => async (prioritised: number) => {
    await this.updateAct((ns) => {
      ns.get(noteId)!.prioritised = prioritised
    })
    await this._writeThrough(noteId)
  }
}
