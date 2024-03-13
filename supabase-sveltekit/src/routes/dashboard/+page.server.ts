export const ssr = false
import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
  const sess = await locals.getSession()
  if (sess == null) {
    redirect(302, "/login")
  }
}
