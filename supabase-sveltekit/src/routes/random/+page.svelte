<script lang="ts">
  import { trpc } from "$lib/trpc/client"
  import { page } from "$app/stores"
  const { subtle } = crypto
  import { onMount } from "svelte"
  import { DEBUG, getKey, sbLogger, warnIfError } from "shared"
  export let data
  const { supabase } = data
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const T = trpc($page)
  const importPassword = (password: string) =>
    subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"])

  const hashPwd = (password: string, salt: Uint8Array) =>
    importPassword(password).then((k) =>
      subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: 500000 },
        k,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      ),
    )

  // const yoo = async (ts: string) => (await subtle.digest("SHA-256", encoder.encode(ts))).slice(0, 16)

  // const iv = crypto.getRandomValues(new Uint8Array(128 / 8))

  const encrypt = async (key: CryptoKey, plaintext: string, ts: string) =>
    subtle.encrypt(
      { name: "AES-GCM", iv: encoder.encode(await T.nonce.query("hi")) },
      key,
      encoder.encode(plaintext),
    )
  const decrypt = async (key: CryptoKey, cyphertext: ArrayBuffer) =>
    decoder.decode(
      await subtle.decrypt(
        { name: "AES-GCM", iv: encoder.encode(await T.nonce.query("hi")) },
        key,
        cyphertext,
      ),
    )
  const importRawKey = (rawKey: number[]) =>
    subtle.importKey("raw", new Int16Array(rawKey).buffer, "AES-GCM", true, ["encrypt", "decrypt"])
  const exportKey = async (key: CryptoKey) => Array.from(new Int16Array(await subtle.exportKey("raw", key)))

  const yo = async () => {
    console.log(umami.track)
    const salt = encoder.encode(await T.userSalt.query())
    // const iv =
    const key = await hashPwd("heyy", salt)
    const rawKey = await exportKey(key)
    console.log("yoo", DEBUG)
    const k = await getKey(supabase)
    console.log(k)
    if (!k) {
      await supabase
        .from("keys")
        .insert({ key: rawKey })
        .then(warnIfError(sbLogger(supabase))("key insert"))
      return
    }

    const key2 = await importRawKey(k)

    const enc = await encrypt(
      key,
      "this is some longer message. It's gonna be like 3 sentence long. This is the third. Now let's Try a fourth one, and another one still",
      "henlo",
    )
    console.log(enc)
    const dec = await decrypt(key2, enc)
    console.log(dec)
  }

  onMount(yo)
</script>

henlo
