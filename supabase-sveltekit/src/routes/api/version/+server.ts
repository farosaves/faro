import { CF_PAGES_COMMIT_SHA } from "$env/static/private"

export const GET = () => {
  try {
    return new Response(JSON.stringify({ version: CF_PAGES_COMMIT_SHA }))
    // return new Response(lastCommitUUID.toString());
  } catch (error) {
    return new Response("Error retrieving version", { status: 500 })
  }
}
