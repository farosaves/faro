import { ifErr, type Src, warnIfError, sbLogger, funLog2 } from "$lib/utils"
import type { UUID } from "crypto"
import { getNotesOps, opAndNotes, type PatchTup } from "./notes_ops"
import { either as E, array as A, tuple as T } from "fp-ts"
import { type Writable, get } from "svelte/store"
import { persisted } from "./persisted-store"
import * as devalue from "devalue"
import type { SupabaseClient } from "$lib/db/typeExtras"
import type { Notes } from "$lib/db/types"
import { flow, pipe } from "fp-ts/lib/function"
import { updateStore, applyPatches } from "./utils"


export type Action = E.Either<Src & { id: UUID }, PatchTup>
// export type Action = { type: "src", data: Src & { id: UUID } } | { type: "patchTup", data: PatchTup }

const __f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof __f>

export class ActionQueue {
  queueStore: Writable<Action[]>
  sb: SupabaseClient
  online: () => boolean
  noteStore: Writable<Map<string, Notes>>
  warnIfErr: (where?: string) => <T extends { error: unknown }>(r: T) => T
  log: (where?: string, from?: string) => <T>(n: T) => T
  stuMapStoreDelete: (by: UUID) => void // currently not in use
  constructor(sb: SupabaseClient, online: () => boolean, noteStore: Writable<Map<string, Notes>>, stuMapStoreDelete: (by: UUID) => void) {
    this.queueStore = persisted("actionQueue", [], { serializer: devalue })
    this.sb = sb
    this.online = online
    this.noteStore = noteStore
    this.warnIfErr = warnIfError(sbLogger(sb))
    this.log = funLog2(sbLogger(sb))
    this.stuMapStoreDelete = stuMapStoreDelete
  }

  goOnline = async (user_id: UUID) => {
    const successes = []
    // const { data } = (await this.sb.from("keys").select("*").maybeSingle())
    // if (data?.using_stored || data?.using_derived) // if hasn't deicded don't go online
    for (const action of get(this.queueStore)) {
    //   await match(action)  // if ever more than 2 e.g. tabs
    //     .with({ type: "src" }, ({ data }) => this.pushActionSrc(data))
    //     .with({ type: "patchTup" }, ({ data }) => this.pushAction(user_id)(data))
    //     .exhaustive()
    // or: https://farosapp.com/notes/ac6f8223-fa95-4b4d-b7e8-1960db532dc1
      successes.push(await pipe(action, E.bimap(this.pushActionSrc, this.pushAction(user_id)), E.toUnion))
    }
    this.queueStore.update(flow( // keep unsuccessful
      A.zip(successes), A.filter(([_, success]) => !success), A.map(T.fst)))
  }

  pushAction = (user_id: UUID) => async (patchTup: PatchTup) => {
    if (patchTup.patches.length === 0) return true
    updateStore(this.noteStore)(applyPatches(patchTup.patches))
    // this.log("pushAction")("puuushing") // can do funWarn IF I do encrypted here
    const _pushAction = <U, T extends PromiseLike<{ error: U }>>(f: (a: NQ) => T) =>
      (patchTup: PatchTup) =>
        f(this.sb.from("notes")) // note that the stacks on failed update from xxdo don't get updated properly yet..
          .then(this.warnIfErr("pushAction"))
          .then(
            ifErr(() => updateStore(this.noteStore)(applyPatches(patchTup.inverse))))
    // maps the operation with patchTup.patches to db update
    if (user_id === undefined) throw new Error("tried pushing while not logged in")
    const notesOps = getNotesOps(patchTup.patches, get(this.noteStore))
    if (notesOps.length === 0) return this.log("empty Notes Ops")(true)
    for (const { note } of notesOps)
      note.user_id = user_id
    const { op, notes } = opAndNotes(notesOps)

    let error: unknown
    if (op == "upsert")
      error = (await _pushAction(x => x.upsert(notes))(patchTup)).error
    else if (op == "delete")
      error = (await _pushAction(x => x.delete().in("id", notes.map(n => n.id)))(patchTup)).error
    else throw new Error("unreachable: " + op)
    this.log("push action error")(error)
    // TODO should I check for error here? or push source again and retry...
    if (error) // remove src from stumapstore just in case
      this.stuMapStoreDelete(notesOps[0].note.source_id as UUID)

    return error == null
  }

  act = (user_id: UUID | undefined) => async (patchTup: PatchTup) => {
    if (user_id && await this.pushAction(user_id)(patchTup)) return
    else this.queueStore.update(A.append(E.right(patchTup)))
  }

  pushActionSrc = async (src: Src & { id: UUID }) => {
    const { id, title, domain } = src
    const { data } = await this.sb.from("sources").select().eq("id", id).maybeSingle().then(this.warnIfErr("check for sources"))
    this.log("pushSrc pre-check")(data)
    if (data?.domain == src.domain && data?.title == title) return true
    const { error } = await this.sb.from("sources").insert({ id, title, domain }).then(this.warnIfErr("insert sources"))
    const success = (error == null)
    return success
  }

  actSrc = async (src: Src & { id: UUID }) => {
    if (this.online() && await this.pushActionSrc(src)) return
    else this.queueStore.update(A.append(E.left(src)))
  }
}
