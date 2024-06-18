import { DEBUG } from "shared"

export const GET = async () => {
  const d = DEBUG ? "/" : ""
  const content = `
        User-agent: *
        Disallow: ${d}
    `

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
