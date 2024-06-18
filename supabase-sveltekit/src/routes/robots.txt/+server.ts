export const GET = async () => {
  const content = `
        User-agent: *
        Disallow: /
    `

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
