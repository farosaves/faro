<script lang="ts">
  import { trpc } from "$lib/trpc/client"
  import { page } from "$app/stores"
  import { onMount } from "svelte"
  import {
    arr32_2Bytes,
    decrypt,
    decryptSave,
    encrypt,
    encryptSave,
    exportRawKey,
    getKey,
    hashPwd,
    importRawKey,
    sbLogger,
    warnIfError,
  } from "shared"
  export let data
  const { supabase } = data

  const T = trpc($page)
  const yo = async () => {
    console.log(umami.track)
    const salt = arr32_2Bytes((await T.userSalt.query()) || [])
    const iv = arr32_2Bytes(await T.nonce.query("yo"))
    const key = await hashPwd("heyy", salt)
    const rawKey = await exportRawKey(key)
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
    console.log("raws", rawKey, await exportRawKey(key2))

    const enc = await encrypt(
      key,
      "this is some longer message. It's gonna be like 3 sentence long. This is the third. Now let's Try a fourth one, and another one still",
      iv,
    )

    console.log(enc, "enc")
    console.log(await decrypt(key2, enc, iv))
    // console.log(await decrypt(key2, enc, iv))

    // console.log(dec)
    const { data } = await supabase.from("notes").select("*").limit(1).maybeSingle()
    if (!data) return
    console.log(data, "data")
    const save = await encryptSave(key)(data)
    const note = await decryptSave(key)(save)
    console.log(save, note)
  }

  onMount(yo)
</script>

henlo
