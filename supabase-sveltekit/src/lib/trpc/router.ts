// @ts-ignore
import type { Context } from "$lib/trpc/context"
import { initTRPC } from "@trpc/server"
import z from "zod"
import { add_card } from "./api/cards"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "shared"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SERVICE_ROLE_KEY } from "$env/static/private"

export const t = initTRPC.context<Context>().create()

const serviceSb = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)

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
    const sess = await locals.getSession()
    if (sess) {
      const { access_token, refresh_token } = sess
      return { access_token, refresh_token }
    }
    return
  }),
  // singleNoteBySnippetId: t.procedure.input(z.string()).query(async ({ input }) =>
  //   await serviceSb.from("notes").select("*").eq("snippet_uuid", input).single()),
  singleNote: t.procedure.input(z.string()).query(async ({ input }) =>
    await serviceSb.from("notes").select("*").eq("id", input).single()),
  create_card: t.procedure
    .input(cardInput)
    .mutation(({ input, ctx: { locals } }) => add_card({ ...input, supabase: locals.supabase })),
  note2card: t.procedure
    .input(z.object({ note_id: z.number() }))
    .mutation(({ input: { note_id }, ctx: { locals } }) =>
      add_card({ note_id, supabase: locals.supabase, front: null, back: null }),
    ),
  online: t.procedure.query(() => true as const),
  emailToList: t.procedure.input(z.string()).mutation(async ({ input }) => await serviceSb.from("emails2send").insert({ email: input })),
})
export type Router = typeof router
