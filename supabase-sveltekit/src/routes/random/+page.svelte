<script lang="ts">
  import { trpc } from "$lib/trpc/client"
  import { page } from "$app/stores"
  import { onMount } from "svelte"
  import {
    arr2Bytes,
    decrypt,
    encrypt,
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
    const salt = arr2Bytes((await T.userSalt.query()) || [])
    const iv = arr2Bytes(await T.nonce.query("yo"))
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
  }

  onMount(yo)
</script>

henlo
