// BookmarkStore: browser bookmarks are the master copy of notes (docs/v2.0-implementation-plan.md §1, §2, WS-C).
//
// - Note id = uuidv5(bookmark.url) (codec `noteId`). Bookmarks sharing a URL are one note; the primary bookmark is
//   the one under `Faro/` if any, else the oldest (`dateAdded`, then id).
// - Every URL bookmark is a note. Bookmarks outside `Faro/` ("plain") are read as title only, get their folder
//   path(s) as read-only `derivedTags`, and are never written until the first interaction adopts them.
// - Adoption: the oldest plain bookmark for the URL is kept, every same-URL plain bookmark's folder path becomes a
//   tag (§3.1), the others are deleted, then the title is encoded and the bookmark moved to `Faro/<deepest tag>`.
// - Folder enforcement: a note under `Faro/` always sits in `Faro/<deepest tag>`; `Faro/` folders a change left
//   empty are removed.
//
// Ordering and echo suppression: every operation (load, writes, chrome.bookmarks events) runs on one serial queue.
// Event handlers never trust event payloads as note state; they only collect the URLs an event touched and later
// re-read those URLs from Chrome (`refresh`). Writes skip no-op updates/moves. So the events our own writes cause
// re-read a state that already matches the note store and change nothing, and any burst of events ends in the
// state a full `load` would produce. While Chrome imports bookmarks, events are ignored and a full load follows.
import type { UUID } from "crypto"
import * as devalue from "devalue"
import type { Note, PendingNote } from "$lib/sync/note"
import { persisted } from "$lib/sync/persisted-store"
import { domainTitle, uuidv5 } from "$lib/utils"
import {
  decode, decodeTitle, encode, folderPathToTag, noteId, ARCHIVED, STARRED,
  type EncodableNote, type EncodedBookmark,
} from "./codec"
import { removeEmptyFaroFolders, subtreeUrls, TreeView, type BookmarkNode, type Located } from "./folderSync"

/** What a new note is created from: the content script's pending note plus page title and tags. */
export type NewNoteInput = PendingNote & Pick<Note, "title" | "tags">

/** Note-store changes, in the order they happen. `reset` replaces every note (full load). */
export type NoteChanges = { reset?: Note[], upsert: Note[], remove: string[] }
export type ChangeSink = (changes: NoteChanges) => void | Promise<void>

export interface BookmarkStore {
  /** Walk every bookmark, rebuild the per-device index and deliver all notes as a `reset`. */
  load: () => Promise<Note[]>
  /** Save a highlight: adopt the page's plain bookmark (§5.1) or create a new one. Returns the stored note. */
  newNote: (input: NewNoteInput) => Promise<Note | undefined>
  /** Adopt a plain note's bookmark(s) (no-op when already under `Faro/`). Returns the adopted note. */
  adopt: (note: Note) => Promise<Note | undefined>
  /**
   * Write a note to its bookmark (title, URL, folder). A plain note is adopted first (its tags are added to the
   * folder tags). A missing bookmark is recreated (undo of a delete). Returns the stored note.
   */
  update: (note: Note) => Promise<Note | undefined>
  /** Remove every bookmark with the note's URL. */
  delete: (note: Note) => Promise<void>
  /** Where every change is delivered (from writes, loads and chrome.bookmarks events), awaited in order. */
  onChange: (sink: ChangeSink) => void
  /** Register the chrome.bookmarks listeners (call synchronously at service-worker start). */
  listen: () => void
  /** Resolves once everything queued so far has run. */
  idle: () => Promise<void>
}

const uniq = (xs: string[]) => [...new Set(xs)]
const byAge = (a: Located, b: Located) =>
  (a.node.dateAdded ?? 0) - (b.node.dateAdded ?? 0) || Number(a.node.id) - Number(b.node.id)
/** The bookmark that represents a URL's note: under `Faro/` first, then the oldest. */
export const pickPrimary = (ls: Located[]): Located | undefined =>
  ls.toSorted((a, b) => Number(b.faroPath !== undefined) - Number(a.faroPath !== undefined) || byAge(a, b))[0]

/** Page URL without the `:~:text=` fragment directive (and without the `#` if nothing else was in the hash). */
export const stripTextFragment = (url: string) => {
  const hash = url.indexOf("#")
  const directive = url.indexOf(":~:")
  if (hash < 0 || directive < hash) return url
  const base = url.slice(0, directive)
  return base.endsWith("#") ? base.slice(0, -1) : base
}

const domainOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return ""
  }
}

/** Builds the note for a URL from all of its bookmarks. */
export const noteFrom = (primary: Located, all: Located[]): Note => {
  const underFaro = primary.faroPath !== undefined
  const d = decode(primary.node, primary.path, underFaro)
  const domain = domainOf(d.url)
  const created_at = d.created_at ?? new Date().toISOString()
  const derivedTags = underFaro
    ? []
    : uniq(all.filter(l => l.faroPath === undefined).toSorted(byAge).flatMap(l => folderPathToTag(l.path) ?? []))
  return {
    id: d.id as UUID,
    url: d.url,
    title: d.title,
    quote: d.quote,
    tags: d.tags,
    prioritised: d.prioritised,
    domain,
    source_id: uuidv5(domainTitle({ domain, title: d.title })),
    created_at,
    updated_at: created_at,
    underFaro,
    derivedTags,
  }
}

const normPrio = (p: number) => p > 0 ? STARRED : p < 0 ? ARCHIVED : 0
const sameParts = (a: EncodableNote, b: Omit<EncodableNote, "url">) => {
  const at = a.tags.filter(t => t !== ""), bt = b.tags.filter(t => t !== "")
  return a.title === b.title && a.quote === b.quote && normPrio(a.prioritised) === normPrio(b.prioritised)
    && at.length === bt.length && at.every((t, i) => t === bt[i])
}

type Pending = { urls: Set<string>, subtrees: Set<string>, emptied: Set<string>, full: boolean }
const noPending = (): Pending => ({ urls: new Set(), subtrees: new Set(), emptied: new Set(), full: false })

export class ChromeBookmarkStore implements BookmarkStore {
  private tail: Promise<unknown> = Promise.resolve()
  private sink: ChangeSink = () => {}
  /** Per-device index noteId → primary chrome bookmark id (decision 2), kept in IndexedDB. */
  private index = persisted<Map<string, string>>("bookmarkIndex", new Map(), { serializer: devalue, storage: "indexedDB" })
  private primaryOf = new Map<string, string>()
  /** chrome bookmark id → URL, for every URL bookmark (old URL when an `onChanged` changes it). */
  private urlOf = new Map<string, string>()
  /** Parent of a deleted note's bookmark, so undoing the delete can put a plain bookmark back. */
  private deletedParent = new Map<string, string>()
  private pending = noPending()
  private flushQueued = false
  private importing = false

  onChange = (sink: ChangeSink) => {
    this.sink = sink
  }

  private run = <T>(task: () => Promise<T>): Promise<T> => {
    const p = this.tail.then(task)
    this.tail = p.catch(e => console.error("BookmarkStore task failed", e))
    return p
  }

  idle = () => this.run(async () => {})

  // ---------- reading ----------

  load = () => this.run(() => this.loadTask())

  private loadTask = async () => {
    const tree = new TreeView()
    const groups = new Map<string, Located[]>()
    for (const l of await tree.walkAll()) {
      const id = noteId(l.node.url)
      groups.set(id, [...groups.get(id) ?? [], l])
    }
    this.urlOf.clear()
    this.primaryOf.clear()
    const notes: Note[] = []
    const emptied = new Set<string | undefined>()
    for (const ls of groups.values()) {
      const primary = pickPrimary(ls)!
      const note = noteFrom(primary, ls)
      ls.forEach(l => this.urlOf.set(l.node.id, l.node.url))
      this.primaryOf.set(note.id, primary.node.id)
      emptied.add(await this.enforceFolder(tree, primary, note))
      notes.push(note)
    }
    await removeEmptyFaroFolders(emptied)
    this.saveIndex()
    await this.sink({ reset: notes, upsert: [], remove: [] })
    return notes
  }

  /** Re-reads the given URLs from Chrome and delivers the resulting notes (or removals). In-queue only. */
  private refresh = async (urls: Iterable<string>, emptied: Set<string | undefined> = new Set()) => {
    const tree = new TreeView()
    const changes: NoteChanges = { upsert: [], remove: [] }
    for (const url of new Set(urls)) {
      const id = noteId(url)
      for (const [bm, u] of this.urlOf) if (u === url) this.urlOf.delete(bm)
      const ls = await tree.findAll(url)
      const primary = pickPrimary(ls)
      if (!primary) {
        this.primaryOf.delete(id)
        changes.remove.push(id)
        continue
      }
      const note = noteFrom(primary, ls)
      ls.forEach(l => this.urlOf.set(l.node.id, l.node.url))
      this.primaryOf.set(id, primary.node.id)
      emptied.add(await this.enforceFolder(tree, primary, note))
      changes.upsert.push(note)
    }
    await removeEmptyFaroFolders(emptied)
    this.saveIndex()
    await this.sink(changes)
    return changes
  }

  private saveIndex = () => this.index.set(new Map(this.primaryOf))

  /** Moves a note under `Faro/` into `Faro/<deepest tag>`; returns the folder it left. */
  private enforceFolder = async (tree: TreeView, l: Located, note: Note) => {
    if (l.faroPath === undefined) return undefined
    const want = encode(note).folderPath
    if (want.length === l.faroPath.length && want.every((s, i) => s === l.faroPath![i])) return undefined
    const parentId = await tree.ensureFolderPath(want)
    await chrome.bookmarks.move(l.node.id, { parentId })
    return l.node.parentId
  }

  // ---------- writing ----------

  /** Puts the encoded note into bookmark `l` (or a new one), skipping no-op updates. Returns the bookmark. */
  private place = async (tree: TreeView, l: Located | undefined, enc: EncodedBookmark, parts: EncodableNote,
    emptied: Set<string | undefined>): Promise<BookmarkNode> => {
    const parentId = await tree.ensureFolderPath(enc.folderPath)
    if (!l) return await chrome.bookmarks.create({ parentId, title: enc.title, url: enc.url }) as BookmarkNode
    let node = l.node
    const change: { title?: string, url?: string } = {}
    const titleOk = l.node.title === enc.title || (l.faroPath !== undefined && sameParts(parts, decodeTitle(l.node.title)))
    if (!titleOk) change.title = enc.title
    if (l.node.url !== enc.url) change.url = enc.url
    if (change.title !== undefined || change.url !== undefined)
      node = await chrome.bookmarks.update(l.node.id, change) as BookmarkNode
    if (l.node.parentId !== parentId) {
      if (l.faroPath !== undefined) emptied.add(l.node.parentId)
      node = await chrome.bookmarks.move(l.node.id, { parentId }) as BookmarkNode
    }
    return node
  }

  /**
   * Adopts the plain bookmarks `plains` (same URL): keeps the oldest, gives it every folder path as a tag plus
   * `extraTags`, deletes the others, and writes it under `Faro/`. `patch` overrides url/title/quote/prioritised.
   */
  private adoptPlains = async (tree: TreeView, plains: Located[], extraTags: string[],
    patch: Partial<Pick<EncodableNote, "url" | "title" | "quote" | "prioritised">>, emptied: Set<string | undefined>) => {
    const sorted = plains.toSorted(byAge)
    const keep = sorted[0]
    const base = decode(keep.node, keep.path, false)
    const parts: EncodableNote = {
      url: patch.url ?? base.url,
      title: patch.title ?? base.title,
      quote: patch.quote ?? "",
      prioritised: patch.prioritised ?? 0,
      tags: uniq([...sorted.flatMap(l => folderPathToTag(l.path) ?? []), ...extraTags]),
    }
    for (const dup of sorted.slice(1)) await chrome.bookmarks.remove(dup.node.id)
    return this.place(tree, keep, encode(parts), parts, emptied)
  }

  private noteFor = (changes: NoteChanges, url: string) => changes.upsert.find(n => n.id === noteId(url))

  /** All bookmarks for a note; uses the index to skip the URL search for an adopted note. */
  private bookmarksOf = async (tree: TreeView, note: Pick<Note, "id" | "url">): Promise<Located[]> => {
    const bm = this.primaryOf.get(note.id)
    if (bm) {
      try {
        const [node] = await chrome.bookmarks.get(bm)
        if (node.url === note.url) {
          const l = await tree.locate(node as BookmarkNode)
          if (l.faroPath !== undefined) return [l]
        }
      } catch { /* stale index entry */ }
    }
    return tree.findAll(note.url)
  }

  newNote = (input: NewNoteInput) => this.run(async () => {
    const tree = new TreeView()
    const emptied = new Set<string | undefined>()
    const page = stripTextFragment(input.url)
    const exact = await tree.findAll(input.url)
    const primary = pickPrimary(exact)
    let node: BookmarkNode
    if (primary?.faroPath !== undefined) { // same highlight saved again: merge into it
      const cur = noteFrom(primary, exact)
      const parts = { ...cur, title: input.title, quote: input.quote, tags: uniq([...cur.tags, ...input.tags]) }
      node = await this.place(tree, primary, encode(parts), parts, emptied)
    } else if (primary) {
      node = await this.adoptPlains(tree, exact, input.tags, { title: input.title, quote: input.quote }, emptied)
    } else {
      const plains = page === input.url ? [] : (await tree.findAll(page)).filter(l => l.faroPath === undefined)
      if (plains.length) {
        node = await this.adoptPlains(tree, plains, input.tags, { url: input.url, title: input.title, quote: input.quote }, emptied)
      } else {
        const parts = { url: input.url, title: input.title, quote: input.quote, tags: input.tags, prioritised: 0 }
        node = await this.place(tree, undefined, encode(parts), parts, emptied)
      }
    }
    const changes = await this.refresh(uniq([page, input.url, node.url]), emptied)
    return this.noteFor(changes, node.url)
  })

  adopt = (note: Note) => this.run(async () => {
    const tree = new TreeView()
    const emptied = new Set<string | undefined>()
    const ls = await tree.findAll(note.url)
    if (ls.length && ls.every(l => l.faroPath === undefined))
      await this.adoptPlains(tree, ls, [], {}, emptied)
    return this.noteFor(await this.refresh([note.url], emptied), note.url)
  })

  update = (note: Note) => this.run(async () => {
    const tree = new TreeView()
    const emptied = new Set<string | undefined>()
    const ls = await this.bookmarksOf(tree, note)
    const primary = pickPrimary(ls)
    let node: BookmarkNode
    if (primary?.faroPath !== undefined) {
      node = await this.place(tree, primary, encode(note), note, emptied)
    } else if (primary) {
      node = await this.adoptPlains(tree, ls, note.tags,
        { title: note.title, quote: note.quote, prioritised: note.prioritised }, emptied)
    } else if (note.underFaro) { // recreate (undo of a delete)
      node = await this.place(tree, undefined, encode(note), note, emptied)
    } else {
      const parentId = await this.existingFolder(this.deletedParent.get(note.id)) ?? await tree.ensureFaro()
      node = await chrome.bookmarks.create({ parentId, title: note.title, url: note.url }) as BookmarkNode
    }
    const changes = await this.refresh(uniq([note.url, node.url]), emptied)
    return this.noteFor(changes, node.url)
  })

  private existingFolder = async (id: string | undefined) => {
    if (!id) return undefined
    try {
      const [n] = await chrome.bookmarks.get(id)
      return n.url === undefined ? n.id : undefined
    } catch {
      return undefined
    }
  }

  delete = (note: Note) => this.run(async () => {
    const tree = new TreeView()
    const ls = await tree.findAll(note.url)
    const emptied = new Set<string | undefined>()
    const primary = pickPrimary(ls)
    if (primary?.node.parentId) this.deletedParent.set(note.id, primary.node.parentId)
    for (const l of ls) {
      await chrome.bookmarks.remove(l.node.id)
      if (l.faroPath !== undefined) emptied.add(l.node.parentId)
    }
    await this.refresh([note.url], emptied)
  })

  // ---------- chrome.bookmarks events ----------

  private schedule = (f: (p: Pending) => void) => {
    if (this.importing) return
    f(this.pending)
    if (this.flushQueued) return
    this.flushQueued = true
    this.run(async () => {
      this.flushQueued = false
      const p = this.pending
      this.pending = noPending()
      if (p.full) {
        await this.loadTask()
        return
      }
      const tree = new TreeView()
      const urls = new Set(p.urls)
      for (const id of p.subtrees) for (const u of await tree.urlsBelow(id)) urls.add(u)
      await this.refresh(urls, new Set(p.emptied))
    })
  }

  listen = () => {
    const bm = chrome.bookmarks
    bm.onCreated.addListener((_id, node) => {
      if (node.url !== undefined) this.schedule(p => p.urls.add(node.url!))
    })
    bm.onChanged.addListener((id, info) => this.schedule((p) => {
      const old = this.urlOf.get(id)
      if (old !== undefined) p.urls.add(old)
      if (info.url !== undefined) p.urls.add(info.url)
      else p.subtrees.add(id) // a renamed folder changes the path of everything below it
    }))
    bm.onMoved.addListener((id, info) => this.schedule((p) => {
      p.subtrees.add(id)
      p.emptied.add(info.oldParentId)
    }))
    bm.onRemoved.addListener((id, info) => this.schedule((p) => {
      p.emptied.add(info.parentId)
      const old = this.urlOf.get(id)
      if (old !== undefined) p.urls.add(old)
      if (info.node.url !== undefined) p.urls.add(info.node.url)
      else if (info.node.children) subtreeUrls(info.node.children).forEach(u => p.urls.add(u))
      else p.full = true // folder removed without its children listed: fall back to a full load
    }))
    bm.onImportBegan.addListener(() => {
      this.importing = true
    })
    bm.onImportEnded.addListener(() => {
      this.importing = false
      this.schedule(p => p.full = true)
    })
  }
}

export const createBookmarkStore = () => new ChromeBookmarkStore()
