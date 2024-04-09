// @ts-ignore
import type { Context } from "$lib/trpc/context"
import { initTRPC } from "@trpc/server"
import z from "zod"
import { add_card } from "./api/cards"

export const t = initTRPC.context<Context>().create()

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
  create_card: t.procedure
    .input(cardInput)
    .mutation(({ input, ctx: { locals } }) => add_card({ ...input, supabase: locals.supabase })),
  note2card: t.procedure
    .input(z.object({ note_id: z.number() }))
    .mutation(({ input: { note_id }, ctx: { locals } }) =>
      add_card({ note_id, supabase: locals.supabase, front: null, back: null }),
    ),

})
export type Router = typeof router
