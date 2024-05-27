import { fail, redirect } from "@sveltejs/kit"

export const load = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession()

  if (!session) {
    throw redirect(303, "/account/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, website, avatar_url")
    .eq("id", session.user.id)
    .single()

  return { session, profile }
}

export const actions = {
  update: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData()
    console.log(formData)
    const username = formData.get("username") as string
    const website = formData.get("website") as string
    const avatarUrl = formData.get("avatarUrl") as string
    const { session } = await safeGetSession()

    const { error } = await supabase.from("profiles").upsert({
      id: session?.user.id || "",
      username,
      website,
      avatar_url: avatarUrl,
      updated_at: new Date().toUTCString(),
    })
    if (error) {
      return fail(500, {
        username,
        website,
        avatarUrl,
      })
    }

    return {
      username,
      website,
      avatarUrl,
    }
  },
}
