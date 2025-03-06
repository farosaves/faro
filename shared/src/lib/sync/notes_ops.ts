import { option as O, record as R, string as S, array as A, map as M, eq } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Note } from "./note"
import type { Patch } from "immer"
import { funLog, getOrElse } from "$lib/utils"
import { persisted, type StorageType } from "./persisted-store"
import * as devalue from "devalue"

export type PatchTup = { patches: Patch[], inverse: Patch[] }

const _undo_stack: PatchTup[] = []
const _redo_stack: PatchTup[] = []
const _xxdoStacks = { undo: _undo_stack, redo: _redo_stack }
export const xxdoStacks = (storage?: StorageType) => persisted<typeof _xxdoStacks>("xxdoStacks", _xxdoStacks, { storage, serializer: devalue })

export type NotesOps = {
  op: "upsert" | "delete"
  note: Note
}[]
const _getOp = (x: Patch): NotesOps[0]["op"] => (x.op == "remove" && x.path.length == 1) ? "delete" : "upsert"

export const getNotesOps = (patches: Patch[], ns: Map<string, Note>): NotesOps => patches
  .map(funLog("getNotesOps"))
  .map(x =>
    pipe(
      O.fromNullable(x.path[0] as string),
      O.chain(p => M.lookup(S.Eq)(p, ns)), // 1. from the store - e.g. tag udpate]
      O.map(note => ({ op: _getOp(x), note })), // if we got from store decide what to do
      getOrElse(() => { // not in store Or path wrong
        if (x.path.length == 1) return { op: _getOp(x), note: x.value || { id: x.path.at(0) } } // probably will fail but should chack - then x.value is note that was deleted
        // no path: means goddam patch contains all notes
        else {
          console.log("using patch fallback")
          const deletedId = A.head(A.difference(S.Eq)(R.keys(x.value), M.keys(S.Ord)(ns)))
          if (O.isSome(deletedId)) return { op: "upsert", note: x.value[deletedId.value] }
          const addedId = A.head(A.difference(S.Eq)(M.keys(S.Ord)(ns), R.keys(x.value)))
          if (O.isSome(addedId)) return { op: "delete", note: ns.get(addedId.value) }
          throw new Error("didnt get note from patch")
        }
      }),
    ),
  )

export const opAndNotes = (notesOps: NotesOps) => {
  const ops = notesOps.map(x => x.op)
  const notes = pipe(notesOps, A.map(x => x.note), A.uniq(eq.contramap((n: Note) => n.id)(S.Eq)))
  if (A.uniq(S.Eq)(ops).length > 1) throw new Error("more than 1 operation type in action")
  const [op] = ops
  return { op, notes }
}
