export async function GET({ locals }) {
  const { session, user } = await locals.safeGetSession()

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  }

  if (!session || !user) {
    return new Response(JSON.stringify({ isLoggedIn: false }), {
      status: 200,
      headers: headers,
    })
  }

  return new Response(JSON.stringify({ isLoggedIn: true }), {
    status: 200,
    headers: headers,
  })
}
