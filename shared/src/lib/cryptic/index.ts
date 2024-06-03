import type { Notes } from "$lib/db/types"
import { stringify, parse } from "devalue"
import { pick } from "$lib/utils"

const { subtle } = crypto
const encoder = new TextEncoder()
const decoder = new TextDecoder()

const a = [stringify, parse]

const keys = ["tags", "highlights", "user_note", "snippet_uuid", "serialized_highlight", "prioritised", "quote", "url", "source_id"] as const

export const encryptNote = async (note: Notes) =>
  pick(note, keys)

export const importPassword = (password: string) =>
  subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"])

export const hashPwd = (password: string, salt: Uint8Array) =>
  importPassword(password).then(k =>
    subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: 500000 },
      k,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    ),
  )

export const encrypt = async (key: CryptoKey, plaintext: string, iv: Uint8Array) =>
  subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  )
export const decrypt = async (key: CryptoKey, cyphertext: ArrayBuffer, iv: Uint8Array) =>
  decoder.decode(
    await subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cyphertext,
    ),
  )
export const importRawKey = (rawKey: number[]) =>
  subtle.importKey("raw", new Int16Array(rawKey).buffer, "AES-GCM", true, ["encrypt", "decrypt"])
export const exportRawKey = async (key: CryptoKey) =>
  Array.from(new Int16Array(await subtle.exportKey("raw", key)))

export const arr2Bytes = (xs: number[]) => new Uint8Array(new Int32Array(xs).buffer)
