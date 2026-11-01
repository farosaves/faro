/* eslint-disable @stylistic/comma-dangle */
// Text-fragment (`#:~:text=`) anchoring: the only note anchor in v2.0.

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

// export let normalize = (s: string) => s.replaceAll(/[\s+\p{P}\s+]/gu, " ");
export const normalize = (s: string | null) => s || ""

/**
 * Converts a Range to a Text Fragment URL component
 */
export const rangyToTextFragment = (r: Range): TextFragment => {
  const quote = r.toString()
  return createTextFragment(quote, 15)
}

export type TextFragment = `:~:text=${string}`

const CONTEXT_SIZE = 8
export const createTextFragment = (text: string, numOccurrence: number): TextFragment => {
  const fullText = normalize(document.body.textContent)

  // For long text (>15 chars), use textStart and textEnd format instead of full text
  const textStartEnd = text.length > 15
    ? encodeURIComponent(text.substring(0, 8)) + "," + encodeURIComponent(text.substring(text.length - 8))
    : encodeURIComponent(text)


  // Find the nth occurrence of the text
  let startPosition = -1
  let currentPosition = 0
  let count = 0

  while (count <= numOccurrence) {
    currentPosition = fullText.indexOf(text, currentPosition)

    if (currentPosition === -1) {
      // Text not found or no more occurrences
      throw new Error(`Text not found or no more occurrences: ${text}, ${numOccurrence}, ${count}`)
    }

    if (count === numOccurrence) {
      startPosition = currentPosition
      break
    }

    currentPosition += text.length // Move past the entire current match to find the next one
    count++
  }

  if (numOccurrence === 0)
    return `:~:text=${textStartEnd}`


  if (startPosition === -1 || count < numOccurrence)
    throw new Error(`Text not found or no more occurrences: ${text}, ${numOccurrence}, ${count}`)

  // Get prefix context if available
  let prefix = ""

  if (startPosition > 0) {
    const prefixStart = Math.max(0, startPosition - CONTEXT_SIZE)
    prefix = fullText.substring(prefixStart, startPosition)
  }

  // Get suffix context if available
  let suffix = ""
  const endPosition = startPosition + text.length
  if (endPosition < fullText.length) {
    const suffixEnd = Math.min(fullText.length, endPosition + CONTEXT_SIZE)
    suffix = fullText.substring(endPosition, suffixEnd)
  }

  // Add prefix if available (must be properly encoded)
  let fragment = ""
  if (prefix) {
    fragment += encodeURIComponent(prefix) + "-,"
  }

  // Add the main text (properly encoded)
  if (text.length > 15) {
    // For long text, use textStart,textEnd format
    const textStart = text.substring(0, 8)
    const textEnd = text.substring(text.length - 8)
    fragment += encodeURIComponent(textStart) + "," + encodeURIComponent(textEnd)
  } else {
    // For shorter text, use the full text
    fragment += encodeURIComponent(text)
  }

  // Add suffix if available (must be properly encoded)
  if (suffix) {
    fragment += ",-" + encodeURIComponent(suffix)
  }

  return `:~:text=${fragment}`
}

export const regexTextFragment = new RegExp(
  ":~:text=" // The text fragment prefix
  + "(?:(?<prefix>[^-]*)-,)?" // optional prefix followed by -,
  + "(?<mainStart>[^-,]+)" // main text fragment
  + "(,(?!-)(?<mainEnd>[^-,]+))?" // optional second main textxe
  + "(?:,-(?<suffix>[^-]*))?", // optional suffix with ,- prefix
)

export const textFragmentToIndices = (fragment: string): [number, number] => {
  // Parse the text fragment using the regex
  const textMatch = fragment.match(regexTextFragment)
  if (!textMatch) return [0, 0]

  // Extract and decode components using destructuring and ternaries
  const { prefix, mainStart, mainEnd, suffix } = textMatch.groups || {}
  const decodedMainStart = decodeURIComponent(mainStart ?? "")
  const decodedMainEnd = decodeURIComponent(mainEnd ?? "")
  const decodedPrefix = decodeURIComponent(prefix ?? "")
  const decodedSuffix = decodeURIComponent(suffix ?? "")

  if (!decodedMainStart) return [0, 0]

  // Get the document text content
  const fullText = typeof document !== "undefined" && document.body
    ? normalize(document.body.textContent)
    : ""

  if (!fullText) throw new Error("No text content found")

  // Create pattern fragments with concise ternary operators
  const prefixPattern = decodedPrefix ? `${escapeRegExp(decodedPrefix)}` : ""
  const mainStartPattern = `(${escapeRegExp(decodedMainStart)}`
  const mainEndPattern = decodedMainEnd ? `[\\s\\S]*?${escapeRegExp(decodedMainEnd)}` : ""
  const suffixPattern = decodedSuffix ? `)${escapeRegExp(decodedSuffix)}` : ")"

  // Combine patterns
  const fullPattern = new RegExp(`${prefixPattern}${mainStartPattern}${mainEndPattern}${suffixPattern}`, "i")

  // Find the match
  const match = fullText.match(fullPattern)

  // If we found a match with our pattern
  if (match && match.index !== undefined && match[1]) {
    const startIndex = match.index + (decodedPrefix.length || 0)
    const matchedLength = match[1].length
    return [startIndex, startIndex + matchedLength]
  }

  // Fallback: try finding just the main start text
  const startIndex = fullText.indexOf(decodedMainStart)
  if (startIndex === -1) return [0, 0]

  // If no end text, return just the start
  if (!decodedMainEnd) return [startIndex, startIndex + decodedMainStart.length]

  // Try to find end text after start
  const textAfterStart = fullText.substring(startIndex + decodedMainStart.length)
  const endIndex = textAfterStart.indexOf(decodedMainEnd)

  // Return appropriate range based on whether we found the end text
  return endIndex !== -1
    ? [startIndex, startIndex + decodedMainStart.length + endIndex + decodedMainEnd.length]
    : [startIndex, startIndex + decodedMainStart.length]
}
