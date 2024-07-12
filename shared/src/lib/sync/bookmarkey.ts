import { writable } from "svelte/store"
import type { NotesOps } from "./notes_ops"
import { array as A, option as O, eq, string as S, number as N } from "fp-ts"
import type { NoteEx } from "$lib/db/typeExtras"
import { pipe } from "fp-ts/lib/function"
import { note2Url } from "$lib/dashboard/utils"
import { asc, funLog } from "$lib/utils"
const { subtle } = crypto

export const f = (t: NotesOps) => 3
export const dontTrigger = writable(false)

export const createBookmark = async (d: chrome.bookmarks.BookmarkCreateArg) => {
  dontTrigger.set(true)
  await chrome.bookmarks.create(d)
  dontTrigger.set(false)
}
// const desiredTree = NA.groupBy((n: Notes) => A.sort(S.Ord)(n.tags).at(0) || "")
// const desiredTree = (ns: NoteEx[]) => new Map(
//   ns.map(n => [{ url: n.url, title: n.sources.title + " " + n.quote }, A.sort(S.Ord)(n.tags).at(0) || ""]),
// )
interface Bookmark extends chrome.bookmarks.BookmarkTreeNode {
  url: string
  children: undefined
}
interface Folder extends chrome.bookmarks.BookmarkTreeNode {
  url: undefined
  children: chrome.bookmarks.BookmarkTreeNode[]
}
type Node = Folder | Bookmark

const subTree = async (id: string) => await chrome.bookmarks.getSubTree("2") as Node[]

type MyBookmark = { title: string, url: string }
const MBEq = eq.contramap((b: MyBookmark) => b.title + ";;" + b.url)(S.Eq)
const note2Bookmark = (n: NoteEx): MyBookmark => ({ url: note2Url(n).href, title: n.sources.title + " " + n.quote })
const unsafeBookmark2Id = (f: Folder) => (b: MyBookmark): string =>
  f.children.filter(c => c.title == b.title).filter(c => c.url == b.url)[0].id

let prevHash: ArrayBuffer
const encoder = new TextEncoder()
// const abEq = (x: ArrayBuffer, y: ArrayBuffer) => pipe([x, y].map(t => Array.from(new Int32Array(t))), ([a, b]) => .equals(a, b))
const abEq = eq.contramap((x: ArrayBuffer) => Array.from(new Int32Array(x)))(A.getEq(N.Eq)).equals

export const syncBookmarks = async (notes: NoteEx[]) => {
  const hash = await subtle.digest("SHA-256", encoder.encode(notes.map(x => x.id).join("")))
  if (abEq(hash, prevHash)) return funLog("syncBookmarks hash same")(hash) // & noop
  prevHash = hash
  const treeInit = (await chrome.bookmarks.getSubTree("2"))[0]
  // ! fix it for Firefox: "Unfiled bookmarks" ?
  if (treeInit.title !== "Other Bookmarks" || !treeInit.children) {
    throw new Error("other root bookmark structures not implemented yet")
  }
  if (!treeInit.children.map(x => x.title == "Faros").reduce((x, y) => x || y)) {
    await createBookmark({ parentId: "2", title: "Faros" })
  }
  const tree = (await subTree("2"))[0]
  if (tree.children === undefined) throw new Error("unreachable (bookmarkey)")
  const farosFolder = tree.children.filter(x => x.title == "Faros")[0] as Node
  if (farosFolder.children === undefined) throw new Error("farosFolder undefined children")

  const desired = notes.map(note2Bookmark)
  const present: MyBookmark[] = pipe(farosFolder.children,
    A.map(({ title, url }) => url ? ({ title, url }) : null),
    A.map(O.fromNullable),
    A.compact,
  )
  A.difference(MBEq)(desired, present).forEach(b =>
    chrome.bookmarks.create({ parentId: farosFolder.id, ...b }),
  )
  A.difference(MBEq)(present, desired).forEach(b =>
    chrome.bookmarks.remove(unsafeBookmark2Id(farosFolder)(b)),
  )

  // const desired = desiredTree(notes) // Record<string, {url, title}  where record keys are subfolder names
  // const present = new Map(farosFolder.children?.flatMap(x => (x.children || []).map(({ title, url }) => {
  //   if (url) return tup([({ title, url }), x.title])
  //   throw new Error("2nd level folder?")
  // })))
  // // create a diff and determine which operations need to be performed
  // // First move them around.
  // // Go over each note and see if the parent is correct.
  // Array.from(present.entries()).forEach(([k, v]) => {
  //   if (desired.get(k) == v) return
  //   // if parent incorrect: move it
  // })


  // Then add new ones.
  // Then delete the old ones.

  // chrome.bookmarks.create({url, title})
}

let lastChecked = 0
const yo = async (latestNote: O.Option<NoteEx>) => {
  const lastBMAdd = (await chrome.bookmarks.getRecent(1)).at(1)?.dateAdded
  lastChecked = Date.now()
  if (!lastBMAdd) return
  // todo: this breaks cuz bookmarks created from notes will always be more recent
  const lastNoteAdd = pipe(latestNote, O.match(() => 0, n => Date.parse(n.created_at)))
  if (lastNoteAdd >= lastBMAdd) return //
}

const walkBookmarksTree = (folder: Folder, parentFolders: string[] = []): (Bookmark & { folders: string[] })[] =>
  (folder.children as Node[]).flatMap(node =>
    (node.url !== undefined)
      ? [{ folders: parentFolders, ...node }] // bookmark
      : walkBookmarksTree(node, [...parentFolders, node.title]), // folder
  ).toSorted(asc(x => x.dateAdded || 0))
