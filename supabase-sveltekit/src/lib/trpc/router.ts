// @ts-ignore
import type { Context } from "$lib/trpc/context"
import { initTRPC } from "@trpc/server"
import z from "zod"
// import { add_card } from "./api/cards"
import { createClient } from "@supabase/supabase-js"
import { funLog, sbLogger, typeCast, warnIfError, type Database } from "shared"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SERVICE_ROLE_KEY, TIMESTAMP_SALT } from "$env/static/private"
import { subtle } from "node:crypto"

export const t = initTRPC.context<Context>().create()

const serviceSb = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)
const warnIfErr = warnIfError(sbLogger(serviceSb))
const encoder = new TextEncoder()

// unfortunately to have type inference in the extension you need to do it manually
const tokens = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
})
// funLog2(sbLogger(serviceSb))("digest")(
const digest = async (str: string) => Array.from(new Int32Array(await subtle.digest("SHA-256", encoder.encode(str + TIMESTAMP_SALT))).slice(0, 16))

export type RedeemCodeErrors = "no user" | "bad code" | "code update failed" | null //  | "code already assigned"

export const router = t.router({
  redeemCode: t.procedure.input(z.object({ code: z.string() })).output(typeCast<{ error: RedeemCodeErrors }>).mutation(
    async ({ input: { code }, ctx: { locals: { safeGetSession } } }) => {
      const user_id = (await safeGetSession())?.user?.id
      if (!user_id) return { error: "no user" }
      const { data } = await serviceSb.from("redemption_codes").select("*").eq("code", code).maybeSingle()
      if (!data) return { error: "bad code" }
      if (data.assigned_to) return { error: "bad code" }
      const { error } = await serviceSb.from("redemption_codes").update({ assigned_to: user_id }).eq("code", code).single()

      if (error) {
        funLog("redeemCode")(error)
        return { error: "code update failed" }
      }
      return { error: null }
    }),

  my_tokens: t.procedure.input(typeCast<{ eagerRefresh: boolean } | undefined>).output(z.optional(tokens)).query(
    async ({ ctx: { locals }, input }) => {
      let { session } = await locals.safeGetSession()

      if (session && input?.eagerRefresh && session.expires_in < 2700)
        ({ data: { session } } = await locals.supabase.auth.refreshSession())
      if (session) {
        const { access_token, refresh_token } = session

        return { access_token, refresh_token }
      }
      return
    }),
  // singleNoteBySnippetId: t.procedure.input(z.string()).query(async ({ input }) =>
  //   await serviceSb.from("notes").select("*").eq("snippet_uuid", input).single()),
  singleNote: t.procedure.input(z.string()).query(async ({ input }) =>
    await serviceSb.from("notes").select("*").eq("id", input).single()),
  // create_card: t.procedure
  //   .input(cardInput)
  //   .mutation(({ input, ctx: { locals } }) => add_card({ ...input, supabase: locals.supabase })),
  // note2card: t.procedure
  //   .input(z.object({ note_id: z.number() }))
  //   .mutation(({ input: { note_id }, ctx: { locals } }) =>
  //     add_card({ note_id, supabase: locals.supabase, front: null, back: null }),
  //   ),
  online: t.procedure.query(() => true as const),
  partingMsg: t.procedure.input(z.string()).mutation(async ({ input }) => await serviceSb.from("partingMsgs").insert({ message: input }).then(warnIfErr("partingMsg"))),
  featRequest: t.procedure.input(z.string()).mutation(async ({ input }) => await serviceSb.from("partingMsgs").insert({ message: "FEAT_REQUEST: " + input }).then(warnIfErr("featRequest"))),

  nonce: t.procedure.input(z.string()).query(async ({ input }) => digest(input)), // digest id
  userSalt: t.procedure.query(async ({ ctx: { locals } }) => {
    const ts = (await locals.safeGetSession()).user?.id
    if (ts) return digest(ts)
  }),

  // uploadMHTML: t.procedure.input(typeCast<{ id: UUID, data: string }>).mutation(({ input }) => uploadMHTML(input.data, input.id)),
  // signInAnon: t.procedure.query(async ({ ctx }) => ctx.locals.supabase.auth.s),
})
export type Router = typeof router
