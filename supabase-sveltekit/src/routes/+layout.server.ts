//  handle the session on the server-side

export const load = async ({ locals: { safeGetSession } }) => {
  return await safeGetSession()
}
