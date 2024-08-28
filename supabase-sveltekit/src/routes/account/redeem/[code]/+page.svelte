<script lang="ts">
  import { funLog, sessStore } from "shared"
  import { option as O } from "fp-ts"
  import { page } from "$app/stores"
  import { trpc } from "$lib/trpc/client.js"
  import { onMount } from "svelte"
  const code = $page.params.code
  const T = trpc($page)

  export let data
  const { supabase } = data

  const runRedemption = async () => {
    const sess = O.toNullable($sessStore)
    if (!sess) return "no user"
    const user_id = sess.user.id
    const { data: codeRow } = await data.supabase
      .from("redemption_codes")
      .select("*")
      .eq("assigned_to", user_id)
      .maybeSingle()
    if (codeRow) return "redeemed already"
    const { error } = await T.redeemCode.mutate({ code })
    return error || "success"
  }
  const redeem = async () => {
    redemptionStatus = await runRedemption()
    // funLog("redeem")(redemptionStatus)
  }
  let redemptionStatus: Awaited<ReturnType<typeof runRedemption>> | "notTriedYet" = "notTriedYet"
  onMount(async () => {
    const { data } = await supabase.auth.getSession()
    if (data) sessStore.set(O.fromNullable(data.session))
  })
</script>

<svelte:head>
  <title>Faro - Redeem AppSumo Code</title>
</svelte:head>
<div class="hero h-screen-minus-80">
  <div
    class="hero-content text-center text-2xl flex-col border border-neutral rounded-box bg-base-100 bg-opacity-30 p-8">
    {#if O.isSome($sessStore)}
      {#if redemptionStatus === "notTriedYet"}
        Thanks for your purchase!
        <button class="btn btn-lg btn-primary" on:click={redeem}>Click here to redeem</button>
      {:else if redemptionStatus === "no user"}
        Error - are you logged in?
      {:else if redemptionStatus === "redeemed already"}
        You have already redeemed a code!
      {:else if redemptionStatus === "success"}
        You have redeemed the code!
      {:else if redemptionStatus === "code update failed"}
        Database error. Retry or write to pawel@farosaves.com
      {:else if redemptionStatus === "bad code"}
        Either invalid code or already used. <br /> If this is wrong, write to pawel@farosaves.com
      {/if}
    {/if}
  </div>
</div>
