import { option as O } from "fp-ts"
import { persisted, type PendingNote } from "shared"
import { writable, type Writable } from "svelte/store"

const _scratches: { [id: string | symbol]: string } = {
  "pl.wikipedia.org;Kalanchoe": "",
}

export const scratches = persisted("scratches", _scratches)

export const optimistic: Writable<O.Option<PendingNote>> = writable(O.none)
