// src/routes/+page.server.ts
import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { funLog } from "shared"

export const load: PageServerLoad = async ({ url, locals: { safeGetSession } }) => {
  const { session } = await safeGetSession().then(funLog("login page srvr load get sess"))

  // if the user is already logged in return them to the dashboard? page
  if (session) {
    throw redirect(303, "/dashboard")
  }

  return { url: url.origin }
}
