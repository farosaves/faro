// src/routes/+page.server.ts
import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"
import { funLog } from "shared"

export const load: LayoutServerLoad = async ({ url, locals: { safeGetSession } }) => {
  const { session } = await safeGetSession().then(funLog("login page srvr load get sess"))
  if (session) {
    throw redirect(303, "/dashboard")
  }
  return { url: url.origin }
}
