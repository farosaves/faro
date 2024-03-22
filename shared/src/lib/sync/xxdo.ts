import { option as O, record as R, string as S, array as A, nonEmptyArray as NA } from "fp-ts"
import { flip, flow, identity, pipe } from "fp-ts/lib/function"
import type { Notes } from "$lib/db/types"
import type { Patch } from "immer"
import { getOrElse } from "$lib/utils"
import { persisted } from "svelte-persisted-store"

export type PatchTup = { patches: Patch[], inverse: Patch[] }

const _undo_stack: PatchTup[] = []
const _redo_stack: PatchTup[] = []
export const xxdoStacks = persisted("xxdoStacks", { undo: _undo_stack, redo: _redo_stack })

export type NotesOps = {
    op: "upsert" | "delete"
    note: Notes
}[]
const _getOp = (x: Patch): NotesOps[0]["op"] => (x.op == "remove" && x.path.length == 1) ? "delete" : "upsert"

export const getNotesOps = (patches: Patch[], ns: Record<string, Notes>): NotesOps => patches
    // .filter(x => x.op != "remove")
    .map(x =>
        pipe(
            O.fromNullable(x.path[0] as string),
            O.chain(p => R.lookup(p, ns)), // 1. from the store - e.g. tag udpate]
            O.map(note => ({ op: _getOp(x), note })),  // if we got from store decide what to do
            getOrElse(() => {  // not in store Or path wrong
                if (x.path.length == 1) return { op: _getOp(x), note: x.value }   // probably will fail but should chack - then x.value is note that was deleted
                // no path: means goddam patch contains all notes
                else {
                    console.log("using patch fallback")
                    const deletedId = A.head(A.difference(S.Eq)(R.keys(x.value), R.keys(ns)))
                    if (O.isSome(deletedId)) return { op: "upsert", note: x.value[deletedId.value] }
                    const addedId = A.head(A.difference(S.Eq)(R.keys(ns), R.keys(x.value)))
                    if (O.isSome(addedId)) return { op: "delete", note: ns[addedId.value] }
                    throw new Error("didnt get note from patch")
                }
            }),
        ),
    )
