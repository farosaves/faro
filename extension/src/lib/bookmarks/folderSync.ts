// chrome.bookmarks tree helpers for the BookmarkStore: locating bookmarks (folder path, under `Faro/` or not),
// creating the folder a note is forced into, and removing `Faro/` folders that a change left empty.
// See docs/v2.0-implementation-plan.md §3, §4 and WS-C.

/** Chrome's "Other bookmarks" root. Its title is localised, so it is found by id only. Firefox is deferred. */
export const FARO_PARENT_ID = "2"
export const FARO_TITLE = "Faro"
const ROOT_ID = "0"

export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode & { url: string }

/** A URL bookmark together with where it sits. */
export type Located = {
  node: BookmarkNode
  /** Folder titles from the top-level browser folder (`Bookmarks bar`, …) down to the bookmark's parent. */
  path: string[]
  /** Folder titles below `Faro/` when the bookmark lives under it, otherwise undefined. */
  faroPath: string[] | undefined
}

const isFolder = (n: chrome.bookmarks.BookmarkTreeNode) => n.url === undefined

const getNode = async (id: string) => {
  try {
    return (await chrome.bookmarks.get(id))[0]
  } catch {
    return undefined // removed meanwhile
  }
}

/** The `Faro` folder: the first folder titled `Faro` directly in "Other bookmarks". */
export const findFaroFolder = async (): Promise<string | undefined> =>
  (await chrome.bookmarks.getChildren(FARO_PARENT_ID)).find(c => isFolder(c) && c.title === FARO_TITLE)?.id

/** A view of the tree for one store task; folder lookups are cached, so build a new one per task. */
export class TreeView {
  private folders = new Map<string, chrome.bookmarks.BookmarkTreeNode>()
  private faroId: Promise<string | undefined> | undefined

  faro = () => (this.faroId ??= findFaroFolder())

  ensureFaro = async () => {
    const id = await this.faro()
    if (id) return id
    const created = await chrome.bookmarks.create({ parentId: FARO_PARENT_ID, title: FARO_TITLE })
    this.faroId = Promise.resolve(created.id)
    return created.id
  }

  private folder = async (id: string) => {
    const cached = this.folders.get(id)
    if (cached) return cached
    const n = await getNode(id)
    if (n) this.folders.set(id, n)
    return n
  }

  /** Folders from the top-level browser folder down to (and including) `folderId`. */
  private chain = async (folderId: string | undefined) => {
    const out: chrome.bookmarks.BookmarkTreeNode[] = []
    let id = folderId
    while (id && id !== ROOT_ID) {
      const f = await this.folder(id)
      if (!f) break
      out.unshift(f)
      id = f.parentId
    }
    return out
  }

  locate = async (node: BookmarkNode): Promise<Located> => {
    const chain = await this.chain(node.parentId)
    const faroId = await this.faro()
    const i = faroId === undefined ? -1 : chain.findIndex(f => f.id === faroId)
    return {
      node,
      path: chain.map(f => f.title),
      faroPath: i < 0 ? undefined : chain.slice(i + 1).map(f => f.title),
    }
  }

  /** Every bookmark whose URL is exactly `url`. */
  findAll = async (url: string): Promise<Located[]> => {
    let hits: chrome.bookmarks.BookmarkTreeNode[]
    try {
      hits = await chrome.bookmarks.search({ url })
    } catch {
      return [] // not a URL Chrome accepts as a search key
    }
    return Promise.all(hits.filter(h => h.url === url).map(h => this.locate(h as BookmarkNode)))
  }

  /** Every URL bookmark in the whole tree (all roots). */
  walkAll = async (): Promise<Located[]> => {
    const [root] = await chrome.bookmarks.getTree()
    const faroId = await this.faro()
    const out: Located[] = []
    const walk = (n: chrome.bookmarks.BookmarkTreeNode, path: string[], faroPath: string[] | undefined) => {
      if (!isFolder(n)) {
        out.push({ node: n as BookmarkNode, path, faroPath })
        return
      }
      const inner = n.id === ROOT_ID ? [] : [...path, n.title]
      const innerFaro = n.id === faroId ? [] : faroPath === undefined ? undefined : [...faroPath, n.title]
      for (const c of n.children ?? []) walk(c, inner, innerFaro)
    }
    walk(root, [], undefined)
    return out
  }

  /** URLs of every bookmark at or below `id` (a bookmark or a folder). */
  urlsBelow = async (id: string): Promise<string[]> => {
    let sub: chrome.bookmarks.BookmarkTreeNode[]
    try {
      sub = await chrome.bookmarks.getSubTree(id)
    } catch {
      return []
    }
    return subtreeUrls(sub)
  }

  /** The folder `Faro/<segments>`, created as needed. */
  ensureFolderPath = async (segments: string[]) => {
    let parentId = await this.ensureFaro()
    for (const seg of segments) {
      const children = await chrome.bookmarks.getChildren(parentId)
      parentId = children.find(c => isFolder(c) && c.title === seg)?.id
        ?? (await chrome.bookmarks.create({ parentId, title: seg })).id
    }
    return parentId
  }
}

export const subtreeUrls = (nodes: chrome.bookmarks.BookmarkTreeNode[]): string[] =>
  nodes.flatMap(n => n.url !== undefined ? [n.url] : subtreeUrls(n.children ?? []))

/**
 * Removes folders under `Faro/` (never `Faro` itself, never anything outside it) that are empty, starting at each
 * candidate and walking up while the parent becomes empty too.
 */
export const removeEmptyFaroFolders = async (candidates: Iterable<string | undefined>) => {
  const faroId = await findFaroFolder()
  if (!faroId) return
  for (const start of candidates) {
    let id = start
    while (id && id !== faroId) {
      const node = await getNode(id)
      if (!node || !isFolder(node) || !(await isBelow(node, faroId))) break
      if ((await chrome.bookmarks.getChildren(id)).length > 0) break
      await chrome.bookmarks.remove(id)
      id = node.parentId
    }
  }
}

const isBelow = async (node: chrome.bookmarks.BookmarkTreeNode, ancestorId: string) => {
  let id = node.parentId
  while (id && id !== ROOT_ID) {
    if (id === ancestorId) return true
    id = (await getNode(id))?.parentId
  }
  return false
}
