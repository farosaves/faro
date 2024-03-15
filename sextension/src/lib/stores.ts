import { persisted } from "svelte-persisted-store"
import type { SupabaseClient } from "shared"
import { derived, get, type Writable } from "svelte/store"
import { domain_title, hostname, idx } from "shared"

// First param `preferences` is the local storage key.
// Second param is the initial value.

class SBWriteStore<T> {
  sb: SupabaseClient
  store: Writable<T>
  user_id: string | undefined
  constructor(sb: SupabaseClient, user_id: string | undefined, p: Writable<T>) {
    this.sb = sb
    this.store = p
    this.user_id = user_id
  }
}
const _scratches: { [id: string | symbol]: string } = {
  "pl.wikipedia.org;Kalanchoe": "",
}

export const scratches = persisted("scratches", _scratches)
