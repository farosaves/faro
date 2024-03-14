import { redirect } from "@sveltejs/kit"

export const GET = async () => {
  redirect(303, "mailto:pa.paradysz@gmail.com")
  // if the user is already logged in return them to the dashboard? page
}
