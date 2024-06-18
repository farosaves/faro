import { redirect } from "@sveltejs/kit"

export const load = async ({ locals: { supabase, safeGetSession } }) => {
  let msg = ""
  await supabase.auth.signOut().then(({ error }) => {
    if (error) {
      msg = "There was an issue signing out."
    } else {
      throw redirect(303, "/")
    }
  })
  return { msg }
}
