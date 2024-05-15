import { ifErr, logIfError, updateStore, type Src, applyPatches, funLog } from "$lib/utils"
import type { UUID } from "crypto"
import { getNotesOps, type PatchTup } from "./xxdo"
import { either as E, array as A, string as S, tuple as T } from "fp-ts"
import { type Writable, get } from "svelte/store"
import { persisted } from "./persisted-store"
import * as devalue from "devalue"
import type { SupabaseClient } from "$lib/db/typeExtras"
import type { Notes } from "$lib/db/types"
import { flow, pipe } from "fp-ts/lib/function"


export type Action = E.Either<Src & { id: UUID }, PatchTup>
// export type Action = { type: "src", data: Src & { id: UUID } } | { type: "patchTup", data: PatchTup }

const __f = (sb: SupabaseClient) => sb.from("notes")
type NQ = ReturnType<typeof __f>

export class ActionQueue {
  queueStore: Writable<Action[]>
  sb: SupabaseClient
  online: () => boolean
  noteStore: Writable<Map<string, Notes>>
  constructor(sb: SupabaseClient, online: () => boolean, noteStore: Writable<Map<string, Notes>>) {
    this.queueStore = persisted("actionQueue", [], { serializer: devalue })
    this.sb = sb
    this.online = online
    this.noteStore = noteStore
    // this.stuMapStore = stuMapStore
  }

  goOnline = async (user_id: UUID) => {
    const successes = []
    for (const action of get(this.queueStore)) {
      //   await match(action)  // if ever more than 2 e.g. tabs
      //     .with({ type: "src" }, ({ data }) => this.pushActionSrc(data))
      //     .with({ type: "patchTup" }, ({ data }) => this.pushAction(user_id)(data))
      //     .exhaustive()
      // https://farosapp.com/notes/ac6f8223-fa95-4b4d-b7e8-1960db532dc1
      successes.push(await pipe(action, E.bimap(this.pushActionSrc, this.pushAction(user_id)), E.toUnion))
    }
    this.queueStore.update(flow( // keep unsuccessful
      A.zip(successes), A.filter(([_, success]) => !success), A.map(T.fst)))
  }

  pushAction = (user_id: UUID) => async (patchTup: PatchTup) => {
    updateStore(this.noteStore)(applyPatches(patchTup.patches))
    funLog("pushAction")("puuushing")
    const _pushAction = <U, T extends PromiseLike<{ error: U }>>(f: (a: NQ) => T) =>
      (patchTup: PatchTup) =>
        f(this.sb.from("notes")) // note that the stacks on failed update from xxdo don't get updated properly yet..
          .then(logIfError("pushAction"))
          .then(
            ifErr(() => updateStore(this.noteStore)(applyPatches(patchTup.inverse))))
    // maps the operation with patchTup.patches to db update
    if (user_id === undefined) throw new Error("tried pushing while not logged in")
    const notesOps = getNotesOps(patchTup.patches, get(this.noteStore))
    for (const { note } of notesOps)
      note.user_id = user_id

    console.log("notesOps: ", notesOps)
    if (A.uniq(S.Eq)(notesOps.map(x => x.op)).length > 1) throw new Error("nore than 1 operation in xxdo")

    const op = notesOps.map(x => x.op)[0]
    let success: boolean
    if (op == "upsert")
      success = (await _pushAction(x => x.upsert(notesOps.map(on => on.note)))(patchTup)).error == null
    else if (op == "delete")
      success = (await _pushAction(x => x.delete().in("id", notesOps.map(on => on.note.id)))(patchTup)).error == null
    else throw new Error("unreachable")
    funLog("pushActionSuccess")(success)
    return success
  }

  act = (user_id: UUID | undefined) => async (patchTup: PatchTup) => {
    if (user_id && await this.pushAction(user_id)(patchTup)) return
    else this.queueStore.update(A.append(E.right(patchTup)))
    // console.log("AQ", get(this.actionQueue))
    // else throw new Error("only online for now")
  }

  pushActionSrc = async (src: Src & { id: UUID }) => {
    // this.stuMapStore.update(M.upsertAt<UUID>(S.Eq)(src.id, src)) // unnecessary? because sync.sub() refreshes if new note has no src
    const { id, title, domain } = src
    // TODO HERE
    // check if already was added by prolly someone else
    const { data } = await this.sb.from("sources").select().eq("id", id).maybeSingle().then(logIfError("check for sources"))
    if (data?.domain == src.domain && data?.title == title) return true
    const { error } = await this.sb.from("sources").insert({ id, title, domain }).then(logIfError("insert sources"))
    const success = (error == null)
    console.log("pushed source", success)
    if (success) return success
    throw new Error("neither present nor can push")
  }

  actSrc = async (src: Src & { id: UUID }) => {
    if (this.online() && await this.pushActionSrc(src)) return
    else this.queueStore.update(A.append(E.left(src)))
  }
}
