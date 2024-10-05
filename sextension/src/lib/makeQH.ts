export const makeQH = (d: Document, uuid: string, selectedText: string) => {
  const matches = Array.from(d.getElementsByClassName("_" + uuid))
  if (matches.length === 0)
    throw new Error("No elements found with the given UUID")

  const selectedContent = matches.map(el => el.textContent).join(" ")

  const quote = selectedContent
    .replaceAll(/\[\d{1,2}\]/g, "")
    .replaceAll(/\n+/g, " ")
    .trim()

  return {
    quote,
    context: "",
    highlights: [],
  }
}
