// @ts-ignore
import type { Context } from "$lib/trpc/context"
import { initTRPC } from "@trpc/server"
import z from "zod"
// import { add_card } from "./api/cards"
import { createClient } from "@supabase/supabase-js"
import { type Database } from "shared"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SERVICE_ROLE_KEY, TIMESTAMP_SALT } from "$env/static/private"
import { subtle } from "node:crypto"

export const t = initTRPC.context<Context>().create()

const serviceSb = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)
const encoder = new TextEncoder()
const decoder = new TextDecoder()

// unfortunately to have type inference in the extension you need to do it manually
const tokens = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
})
const cardInput = z.object({
  front: z.nullable(z.string()),
  back: z.nullable(z.string()),
  note_id: z.number(),
})

export const router = t.router({
  my_tokens: t.procedure.output(z.optional(tokens)).query(async ({ ctx: { locals } }) => {
    const { session } = await locals.safeGetSession()
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
  partingMsg: t.procedure.input(z.string()).mutation(async ({ input }) => await serviceSb.from("partingMsgs").insert({ message: input })),
  featRequest: t.procedure.input(z.string()).mutation(async ({ input }) => await serviceSb.from("partingMsgs").insert({ message: "FEAT_REQUEST: " + input })),

  nonce: t.procedure.input(z.string()).query(async ({ input }) => decoder.decode((await subtle.digest("SHA-256", encoder.encode(input + TIMESTAMP_SALT))).slice(0, 16))),

  // uploadMHTML: t.procedure.input(typeCast<{ id: UUID, data: string }>).mutation(({ input }) => uploadMHTML(input.data, input.id)),
  // signInAnon: t.procedure.query(async ({ ctx }) => ctx.locals.supabase.auth.s),
})
export type Router = typeof router
