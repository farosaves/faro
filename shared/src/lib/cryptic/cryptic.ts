import type { Notes, Saves } from "$lib/db/types"
import { stringify, parse } from "devalue"
import { pick, pickFields, tup, union } from "$lib/utils"

const { subtle } = crypto
const encoder = new TextEncoder()
const decoder = new TextDecoder()
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
  Array.from(new Int16Array(await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext.length % 2 == 0 ? plaintext : plaintext + " "),
  )))
export const decrypt = async (key: CryptoKey, cyphertext: number[], iv: Uint8Array) =>
  decoder.decode(
    await subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      new Int16Array(cyphertext).buffer,
    ),
  )
export const importRawKey = (rawKey: number[]) =>
  subtle.importKey("raw", new Int16Array(rawKey).buffer, "AES-GCM", true, ["encrypt", "decrypt"])
export const exportRawKey = async (key: CryptoKey) =>
  Array.from(new Int16Array(await subtle.exportKey("raw", key)))

export const arr32_2Bytes = (xs: number[]) => new Uint8Array(new Int32Array(xs).buffer)

const keys = tup(["highlights", "prioritised", "quote", "referer", "serialized_highlight", "snippet_uuid", "source_id", "tags", "url", "user_note"] as const)

const getIv = async (str: string) => new Uint8Array((await subtle.digest("SHA-256", encoder.encode(str))).slice(0, 16))

const saveKeys = tup(["created_at", "id", "updated_at", "user_id"] as const)

export const encryptSave = (key: CryptoKey) => async (note: Notes): Promise<Saves> =>
  union({ encrypted_data: await encrypt(key, stringify(pickFields(note)(keys)), await getIv(note.id)) },
    { ...pick(note, saveKeys) })

export const decryptSave = (key: CryptoKey) => async (save: Saves) =>
  parse(await decrypt(key, save.encrypted_data, await getIv(save.id)))


