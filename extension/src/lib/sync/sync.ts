// note-sync with structura

// @ts-ignore
import { persisted, type Persisted } from "./persisted-store"
import type { Note, Src } from "./note"
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
import type { BookmarkStore, NewNoteInput, NoteChanges } from "$lib/bookmarks/store"

type NoteMapR = Map<string, Note>
export type NoteStoreR = Readable<NoteMapR>
const allNotesR: NoteMapR = new Map()

export type STUMap = Map<UUID, Src>
export type STUMapStoreR = Readable<STUMap>
const stuMap: STUMap = new Map()


export type SyncLike = Pick<NoteSync, "tagChange" | "tagUpdate" | "changePrioritised" | "deleteit" | "undo" | "redo">

const storage = "indexedDB"
const noteStore = persisted<NoteMapR>("noteStore", allNotesR, { serializer: devalue, storage })
const stuMapStore = persisted("stuMapStore", stuMap, { serializer: devalue, storage })

const uniq = (xs: string[]) => [...new Set(xs)]
const sameNote = (a: Note | undefined, b: Note) => a !== undefined && devalue.stringify(a) === devalue.stringify(b)

/**
 * Owns the IndexedDB note cache (`noteStore`) and writes every change through to the BookmarkStore (the master
 * copy). User actions are undoable patches on `noteStore`; changes coming back from the store (canonical notes
 * after a write, full loads, chrome.bookmarks events) are merged in without touching the undo stack.
 */
export class NoteSync {
  store: BookmarkStore
  noteStore: Persisted<NoteMapR>
  stuMapStore: Writable<STUMap>
  invStuMapStore: Readable<Map<string, UUID>>
  xxdoStacks: ReturnType<typeof xxdoStacks>
  DEBUG: boolean

  constructor(store: BookmarkStore) {
    this.store = store
    this.noteStore = noteStore
    this.stuMapStore = stuMapStore
    this.invStuMapStore = derived(this.stuMapStore,
      flow(M.map(domainTitle), invertMap))

    this.xxdoStacks = xxdoStacks(storage)

    this.DEBUG = import.meta.env.VITE_DEBUG || false
    store.onChange(this.applyChanges)
  }

  /**
   * Merges notes decoded from bookmarks into `noteStore`. Fields that only live in IndexedDB (`updated_at`, and
   * anything not encoded in a bookmark) are kept from the cached note with the same id.
   */
  applyChanges = async ({ reset, upsert, remove }: NoteChanges) => {
    await this.noteStore.ready
    const ns = get(this.noteStore)
    const merge = (n: Note): Note => {
      const old = ns.get(n.id)
      return old ? { ...old, ...n, updated_at: old.updated_at || n.updated_at } : n
    }
    const incoming = [...reset ?? [], ...upsert].map(merge)
    const changed = reset !== undefined
      || incoming.some(n => !sameNote(ns.get(n.id), n))
      || remove.some(id => ns.has(id))
    if (!changed) return
    this.noteStore.update((old) => {
      const next = new Map(reset ? [] : old)
      for (const n of incoming) next.set(n.id, n)
      for (const id of remove) next.delete(id)
      return next
    })
    this.stuMapStore.update((old) => {
      const next = new Map(reset ? [] : old)
      for (const n of incoming) next.set(n.source_id, { domain: n.domain, title: n.title })
      return next
    })
  }

  loadFromBookmarks = async () => {
    activeLoadsStore.update(x => x + 1)
    try {
      await this.store.load()
    } finally {
      activeLoadsStore.update(x => x - 1)
    }
  }

  hardReset = () => {
    this.noteStore.set(new Map())
    this.stuMapStore.set(new Map())
    return this.loadFromBookmarks()
  }


  newNote = (input: NewNoteInput) => this.store.newNote(input)

  /**
   * Writes the notes a patch touched to the bookmarks (`before` is a copy of the map from before the patch, for
   * deleted notes). Uses the patch paths rather than object identity: undo/redo patches are applied in place.
   */
  _writePatched = async (patches: PatchTup["patches"], before: NoteMapR) => {
    const after = get(this.noteStore)
    const ids = patches.some(p => p.path.length === 0)
      ? new Set([...before.keys(), ...after.keys()])
      : new Set(patches.map(p => String(p.path[0])))
    for (const id of ids) {
      const a = after.get(id), b = before.get(id)
      if (a) await this.store.update(a)
      else if (b) await this.store.delete(b)
    }
  }

  _xxdo = (patchTup: PatchTup) => {
    const { patches, inverse } = patchTup
    const pTInverted = { inverse: patches, patches: inverse }
    updateStore(this.noteStore)(applyPatches(inverse)) // ! redo by 'default'
    return pTInverted
  }

  _undoRedo = async (from: "undo" | "redo") => {
    const to = from === "undo" ? "redo" : "undo"
    const before = new Map(get(this.noteStore))
    let applied: PatchTup["patches"] = []
    this.xxdoStacks.update((stacks) => {
      const pT = stacks[from].pop()
      console.log(from, pT)
      if (!pT) return stacks
      toastNotify(from === "undo" ? "Undo" : "Redo")
      applied = pT.inverse
      stacks[to].push(this._xxdo(pT))
      return stacks
    })
    await this._writePatched(applied, before)
  }

  undo = () => this._undoRedo("undo")

  redo = () => this._undoRedo("redo")

  stackNAct = (patchTup: PatchTup) => {
    this.xxdoStacks.update(({ undo }) => ({ undo: [...undo, patchTup], redo: [] }))
    return patchTup
  }

  updateAct = (up: (arg: UnFreeze<Map<string, Note>>) => void | Map<string, Note>) =>
    this.stackNAct(updateStore(this.noteStore)(up))

  /** An undoable change to `noteStore`, written through to the bookmarks. */
  _act = async (up: (arg: UnFreeze<Map<string, Note>>) => void | Map<string, Note>) => {
    const before = new Map(get(this.noteStore))
    await this._writePatched(this.updateAct(up).patches, before)
  }

  /**
   * First interaction with a plain bookmark adopts it (folder paths → tags, moved under `Faro/`). Adoption is not
   * undoable; the user's change is then applied on top of the adopted note, so undo reverts just that change.
   */
  _adopted = async (noteId: string) => {
    const n = get(this.noteStore).get(noteId)
    if (!n || n.underFaro) return n
    await this.store.adopt(n)
    return get(this.noteStore).get(noteId)
  }

  deleteit = (noteId: string) => this._act((ns) => {
    ns.delete(noteId)
  })

  updateNote = async (note: Note) => {
    const before = get(this.noteStore).get(note.id)
    const adopted = await this._adopted(note.id)
    const n = before && !before.underFaro && adopted
      ? { ...note, tags: uniq([...adopted.tags, ...note.tags]), underFaro: adopted.underFaro, derivedTags: adopted.derivedTags }
      : note
    await this._act((ns) => {
      ns.set(n.id, n)
    })
  }

  tagChange = (noteId: string) => async (tags: string[]) => {
    const before = get(this.noteStore).get(noteId)
    const adopted = await this._adopted(noteId)
    if (!before || !adopted) return
    const final = before.underFaro ? tags : uniq([...adopted.tags, ...tags])
    await this._act((ns) => {
      ns.get(noteId)!.tags = final
    })
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
    await this._act((ns) => {
      allTags.filter(x => regex.test(x)).forEach(tag =>
        ns.forEach(
          updateTag(tag, pipe(newTag, O.map(s => tag.replace(regex, s))))))
    })
  }


  changePrioritised = (noteId: string) => async (prioritised: number) => {
    if (!(await this._adopted(noteId))) return
    await this._act((ns) => {
      ns.get(noteId)!.prioritised = prioritised
    })
  }
}
