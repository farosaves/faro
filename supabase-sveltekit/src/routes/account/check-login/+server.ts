export async function GET({ locals }) {
  const session = await locals.getSession()

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  }

  if (!session || !session.user) {
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
