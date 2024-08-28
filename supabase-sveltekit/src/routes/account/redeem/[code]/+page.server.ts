export const ssr = false

// const T = trpc({ url: { origin: API_ADDRESS } })

// type CodeStatus = "unauthenticated" | "redeemed already" | "success" | RedeemCodeErrors
// type Load = Promise<{ codeStatus: CodeStatus }>

// export const load = async ({ locals: { supabase, safeGetSession }, params: { code } }): Load => {
//   const { user } = await safeGetSession()
//   if (!user) return { codeStatus: "unauthenticated" }
//   const user_id = user.id
//   const { data } = await supabase.from("redemption_codes").select("*").eq("assigned_to", user_id).maybeSingle()
//   if (data) return { codeStatus: "redeemed already" }
//   const { error } = await T.redeemCode.mutate({ code })
//   return { codeStatus: error ? error : "success" }
// }
