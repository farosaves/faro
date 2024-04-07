import { hostname } from "shared"

export const GET = async ({ url }) => {
  const pageUrl = (url.searchParams.get("url") || "") as string
  //   const pageUrl = JSON.parse(url.searchParams.get("url") || "{}") as string
  const mainLoad = url.searchParams.get("main") || false
  if (!mainLoad) {
    const fetched = await fetch(pageUrl)
    return new Response(await fetched.blob(), { headers: { "Content-Type": fetched.headers.get("Content-Type")! } })
  }
  // also adjust links
  //   const host = hostname(pageUrl).value
  const host = pageUrl.match(/https?:\/\/[^/]+\//u)![0].toString()
  console.log("host", host)
  const text = await fetch(pageUrl).then(x => x.text())
  //   console.log(text)
  //   const text2 = text.replaceAll(/="\/(?=\w)/g, "=\"/api/forward/?url=" + host)
  //   const text3 = text2.replaceAll(/="\/api\/forward\/\?url=/g, "a")

  const text3 = text.replaceAll(/(?<=="\/)[^"]+/g, (s) => {
    console.log("capture:", s)
    // return "api/forward/?url=" + JSON.stringify(host + s)
    return "api/forward/?url=" + (host + s)
  })
  return new Response(text3)
}


