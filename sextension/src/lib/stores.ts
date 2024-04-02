import { persisted } from "shared"

const _scratches: { [id: string | symbol]: string } = {
  "pl.wikipedia.org;Kalanchoe": "",
}

export const scratches = persisted("scratches", _scratches, { storage: "chrome" })
