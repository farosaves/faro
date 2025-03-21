import { writable } from "svelte/store"
import type { NotesOps } from "./notes_ops"
import { array as A, option as O, eq, string as S, number as N } from "fp-ts"
import type { Note } from "./note"
import { pipe } from "fp-ts/lib/function"
import { note2Url } from "$lib/dashboard/utils"
import { asc, desc, funLog, uuidRegex } from "$lib/utils"
const { subtle } = crypto

export const f = (t: NotesOps) => 3
export const dontTrigger = writable(false)

export const createBookmark = async (d: chrome.bookmarks.BookmarkCreateArg) => {
  dontTrigger.set(true)
  await chrome.bookmarks.create(d)
  dontTrigger.set(false)
}
interface Bookmark extends chrome.bookmarks.BookmarkTreeNode {
  url: string
  children: undefined
}
interface Folder extends chrome.bookmarks.BookmarkTreeNode {
  url: undefined
  children: chrome.bookmarks.BookmarkTreeNode[]
}
type Node = Folder | Bookmark

const otherBookmarks = async () => (await chrome.bookmarks.getSubTree("2"))[0] as Node

type MyBookmark = { title: string, url: string, folders: string[] }
// separator used for comparisons
const SEPARATOR = ";;"
const MBEq = eq.contramap((b: MyBookmark) => b.title + SEPARATOR + b.url + SEPARATOR + b.folders.join(SEPARATOR))(S.Eq)
const BEq = eq.contramap((b: Bookmark & { folders: string[] }) => b.title + SEPARATOR + b.url + SEPARATOR + b.folders.join(SEPARATOR))(S.Eq)
const folders = (tags: string[]) => tags.toSorted(desc(t => t.split("/").length, t => t.charCodeAt(0))).at(0)?.split("/") || []
const note2Bookmark = (n: Note): MyBookmark => ({
  url: note2Url(n).href,
  title: n.title + " \"" + n.quote + "\"" + n.tags.map(t => " #" + t).join(""),
  folders: folders(n.tags),
})

const bookmark2Note = (b: MyBookmark): { title: string, quote: string, tags: string[] } => {
  const quoteMatch = b.title.matchAll(/"(.*)" /g).toArray().at(-1)
  const tagsMatch = b.title.matchAll(/ #[^ ]*/g).toArray()
  return {
    title: b.title.split(" \"")[0],
    quote: quoteMatch ? quoteMatch[1] : "",
    tags: tagsMatch ? tagsMatch.map(t => t[1].trim().slice(1)) : [],
  }
}

let prevHash: ArrayBuffer
const encoder = new TextEncoder()
// const abEq = (x: ArrayBuffer, y: ArrayBuffer) => pipe([x, y].map(t => Array.from(new Int32Array(t))), ([a, b]) => .equals(a, b))
const abEq = eq.contramap((x: ArrayBuffer) => Array.from(new Int32Array(x)))(A.getEq(N.Eq)).equals
const faroFolderTitle = "Faro"
export const syncBookmarks = async (notes: Note[]) => {
  const hash = await subtle.digest("SHA-256", encoder.encode(notes.map(x => [x.id, ...x.tags].join("")).join("")))
  if (abEq(hash, prevHash)) return funLog("syncBookmarks hash same")(hash) // & noop
  prevHash = hash
  const treeInit = await otherBookmarks()
  // ! fix it for Firefox: "Unfiled bookmarks" ?
  if (treeInit.title !== "Other Bookmarks" || !treeInit.children) {
    throw new Error("other root bookmark structures not implemented yet")
  }
  if (!treeInit.children.map(x => x.title == faroFolderTitle).reduce((x, y) => x || y)) {
    await createBookmark({ parentId: "2", title: faroFolderTitle })
  }
  const tree = await otherBookmarks()
  if (tree.children === undefined) throw new Error("unreachable (bookmarkey)")
  const faroFolder = tree.children.filter(x => x.title == faroFolderTitle)[0] as Node
  if (faroFolder.children === undefined) throw new Error("faroFolder undefined children")

  const desired = notes.map(note2Bookmark)
  const present = pipe(walkBookmarksTree(faroFolder),
    A.map(b => b.url ? b : null),
    A.map(O.fromNullable),
    A.compact,
  )
  funLog("diff")([desired, present])
  const isFaroUrl = (url: string) => uuidRegex.test(url.split("#_").at(-1) || "")
  for (const b of A.difference(MBEq)(desired, present).filter(({ url }) => isFaroUrl(url)))
    await createNestedBookmark(b, faroFolder.id)
  // A.difference(BEq)(present, desired as (Bookmark & { folders: string[] })[]).filter(({ url }) => isFaroUrl(url)).forEach(b =>
  for (const b of A.difference(BEq)(present, desired as (Bookmark & { folders: string[] })[]).filter(({ url }) => isFaroUrl(url)))
    await removeNestedBookmark(b)
}

let lastUpdated = 0
export const walker = async () => {
  // const rec = (await chrome.bookmarks.getRecent(1))
  const lastBMAdd = (await chrome.bookmarks.getRecent(1)).at(0)?.dateAdded
  // funLog("lastBMAdd")([rec, lastBMAdd])
  if (!lastBMAdd || lastBMAdd <= lastUpdated) return // no new bookmarks since last update
  // do some updates
  // TODO instead of this filter I should filter for those that are locally already - because someone may make a new bookmark in the faro folder lol
  // how would I check if the one in faro folder isn't just a leftover?????
  const allBookmarks = walkBookmarksTree((await chrome.bookmarks.getTree())[0] as Folder).filter(b => b.folders[0] !== "Other Bookmarks" && b.folders[1] !== faroFolderTitle)
  funLog("allBookmarks")(allBookmarks)
  lastUpdated = Date.now()
}

const walkBookmarksTree = (folder: Folder, parentFolders: string[] = []): (Bookmark & { folders: string[] })[] =>
  (folder.children as Node[]).flatMap(node =>
    (node.url !== undefined)
      ? [{ folders: parentFolders, ...node }] // bookmark
      : walkBookmarksTree(node, [...parentFolders, node.title]), // folder
  ).toSorted(asc(x => x.dateAdded || 0))

const createNestedBookmark = async (bookmarkWithFolders: MyBookmark, currentParentId = "2") => {
  // Create or find each folder in the hierarchy
  for (const folderName of bookmarkWithFolders.folders) {
    currentParentId
      = (await findFolder(currentParentId, folderName))?.id
      || (await chrome.bookmarks.create({ parentId: currentParentId, title: folderName })).id
  }

  // Create the bookmark in the final folder
  return chrome.bookmarks.create({
    parentId: currentParentId,
    title: bookmarkWithFolders.title,
    url: bookmarkWithFolders.url,
  })
}

const findFolder = async (parentId: string, folderName: string) => {
  const children = await chrome.bookmarks.getChildren(parentId)
  return children.find(node => node.title === folderName && !node.url)
}

const removeNestedBookmark = async (bookmark: (Bookmark & { folders: string[] })) => {
  await chrome.bookmarks.remove(bookmark.id)

  for (const folderName of bookmark.folders.toReversed()) {
    // Find the current folder
    const searchResults = await chrome.bookmarks.search({ title: folderName })
    const folder = searchResults.find(node => !node.url && node.title === folderName)

    if (!folder) break // Folder not found, stop cleanup

    const children = await chrome.bookmarks.getChildren(folder.id)

    if (children.length === 0) {
      // Folder is empty, remove it
      await chrome.bookmarks.remove(folder.id)
    } else {
      // Folder is not empty, stop cleanup
      break
    }
  }
}
