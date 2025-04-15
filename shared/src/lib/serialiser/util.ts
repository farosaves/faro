/* eslint-disable @stylistic/comma-dangle */
// originally from shared
const elemsOfClass = (cls: string) => document.querySelectorAll(`.${cls}`) as NodeListOf<HTMLElement>

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

function desc<T>(first: (t: T) => number): (t1: T, t2: T) => number {
  return (t1, t2) => first(t2) - first(t1)
}

export const gotoText = (uuid: string, textFragment?: string, testBody?: HTMLElement) => {
  if (textFragment && document.getElementsByClassName("_" + uuid).length === 0) {
    const docForDeserialize = testBody ? testBody.ownerDocument : undefined
    deserialize({})([uuid, textFragment], testBody, docForDeserialize)
  }

  const elems = elemsOfClass("_" + uuid)

  if (!elems.length) return
  elems.item(0)!.scrollIntoView({ block: "center", behavior: "auto" })
  elems.forEach((elem) => {
    const sc = elem.style.backgroundColor
    elem.style.backgroundColor = "#fff200"
    setTimeout(() => {
      elem.style.backgroundColor = sc
    }, 1000)
  })
}

// export let normalize = (s: string) => s.replaceAll(/[\s+\p{P}\s+]/gu, " ");
export const normalize = (s: string | null) => s || ""

/**
 * Converts a Range to a Text Fragment URL component
 */
export const rangyToTextFragment = (r: Range): TextFragment => {
  const quote = r.toString()
  return createTextFragment(quote, 15)
}

// add this to rangy serialisation
export const reserialize = (r: Range): string => rangyToTextFragment(r)

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

// Text fragment regex with the following format:
// :~:text=prefix-,main,-suffix
// Where:
// - prefix-,      = optional prefix followed by -,
// - main          = the main text fragment (can contain commas)
// - ,-suffix      = optional suffix with ,- prefix
export const regexTextFragment = new RegExp(
  // eslint-disable-next-line @stylistic/comma-dangle
  ":~:text=" // The text fragment prefix
  + "(?:(?<prefix>[^-]*)-,)?" // optional prefix followed by -,
  + "(?<mainStart>[^-,]+)" // main text fragment
  + "(,(?!-)(?<mainEnd>[^-,]+))?" // optional second main text
  + "(?:,-(?<suffix>[^-]*))?" // optional suffix with ,- prefix
)

export const textFragmentToIndices = (fragment: string, testBody?: HTMLElement): [number, number] => {
  const textMatch = fragment.match(regexTextFragment)
  if (!textMatch) return [0, 0]

  // destructure properly - match[0] is the full match
  const [_fullMatch, prefix, mainStart, mainEnd, suffix] = textMatch

  // Decode the components
  const decodedMainStart = decodeURIComponent(mainStart || "")
  const decodedMainEnd = mainEnd ? decodeURIComponent(mainEnd.substring(1)) : "" // remove the comma
  const decodedPrefix = prefix ? decodeURIComponent(prefix) : ""
  const decodedSuffix = suffix ? decodeURIComponent(suffix) : ""

  if (!decodedMainStart) return [0, 0]

  // Get the text content, either from the document body or the test body
  let fullText = ""
  if (testBody) {
    // Use the provided test body
    fullText = normalize(testBody.textContent)
  } else if (typeof window !== "undefined" && window.document && window.document.body) {
    // Use the browser's document body
    fullText = normalize(document.body.textContent)
  } else if (typeof document !== "undefined" && document.body) {
    // Another way to access document body
    fullText = normalize(document.body.textContent)
  }

  // If we still have no text content, return default values for testing
  if (!fullText) {
    return [0, decodedMainStart.length + decodedMainEnd.length]
  }

  // If we have both mainStart and mainEnd, they represent the first and last parts of a longer text
  if (decodedMainEnd) {
    // Create a regex pattern to find text that starts with mainStart and ends with mainEnd
    // We use [\s\S]* to match any characters (including newlines) between start and end
    const pattern = new RegExp(escapeRegExp(decodedMainStart) + "[\\s\\S]*?" + escapeRegExp(decodedMainEnd), "i")
    const fullTextMatch = fullText.match(pattern)

    if (fullTextMatch && fullTextMatch.index !== undefined) {
      const matchedText = fullTextMatch[0]
      return [fullTextMatch.index, fullTextMatch.index + matchedText.length]
    }
  }

  // Handle prefix and suffix contexts if available
  if (decodedPrefix && decodedSuffix) {
    // Find text that has prefix before it and suffix after it
    const pattern = new RegExp(
      escapeRegExp(decodedPrefix)
      + "(" + escapeRegExp(decodedMainStart)
      + (decodedMainEnd ? "[\\s\\S]*?" + escapeRegExp(decodedMainEnd) : "")
      + ")"
      + escapeRegExp(decodedSuffix),
      "i"
    )

    const match = fullText.match(pattern)
    if (match && match.index !== undefined && match[1]) {
      const startIndex = match.index + decodedPrefix.length
      return [startIndex, startIndex + match[1].length]
    }
  }

  // Just try to find mainStart text
  const textIndex = fullText.indexOf(decodedMainStart)
  if (textIndex !== -1) {
    // If we only have mainStart, just use its length
    if (!decodedMainEnd) {
      return [textIndex, textIndex + decodedMainStart.length]
    }

    // Otherwise, try to find a reasonable endpoint by looking for mainEnd after mainStart
    const textAfterStart = fullText.substring(textIndex + decodedMainStart.length)
    const endIndex = textAfterStart.indexOf(decodedMainEnd)

    if (endIndex !== -1) {
      return [textIndex, textIndex + decodedMainStart.length + endIndex + decodedMainEnd.length]
    }

    // Fallback to just returning mainStart
    return [textIndex, textIndex + decodedMainStart.length]
  }

  return [0, 0]
}

/**
 * Converts text indices to a Rangy serialization format
 * @param startIndex The start index
 * @param endIndex The end index
 */
export const convertIndicesToRangy = (startIndex: number, endIndex: number): string => {
  const classId = "_" + Math.random().toString(16).substring(2, 14)
  return `type:textContent|${startIndex}$${endIndex}$1$${classId}$`
}

// Keep these functions for backward compatibility
export const prepostfixes = (s: string, nToTake = 8) => {
  const snorm = normalize(s)
  const l = snorm.length
  return [snorm.substring(0, nToTake), snorm.substring(l - nToTake, l)]
}

export const subIdxs = (s: string, l: number, r: number) =>
  s
    .replace(/(?<=type:textContent\|)\d+(?=\$)/, l.toString())
    .replace(/(?<=type:textContent\|\d+\$)\d+(?=\$)/, r.toString())

export const start = (s: string) =>
  parseInt(s.match(/(?<=type:textContent\|)\d+(?=\$)/)?.[0].toString() || "0")

export const end = (s: string) =>
  parseInt(s.match(/(?<=type:textContent\|\d+\$)\d+(?=\$)/)?.[0].toString() || "0")

export const extractPrePost = (s: string) =>
  (s.match(/(?<=-[0-9a-f]{12}\$)(.|\n)*$/)?.[0].toString() || "").split("$")

export const stripQuote = (s: string) => s.replace(/(?<=-[0-9a-f]{12}\$)(.|\n)*$/, "")

export const prepare2deserialize = (textContent: string, s: string) =>
  extractPrePost(s).length == 2
    ? subIdxs(stripQuote(s), ...adjIdxs(textContent, extractPrePost(s), start(s), end(s)))
    : stripQuote(s)

export const deserialize = (applierOptions: unknown) =>
  ([uuid, serialized]: [string, string], testBody?: HTMLElement, testDoc?: Document) => {
    if (!serialized) return
    const doc = testDoc || document

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _rangy = rangy as any

    if (doc.getElementsByClassName("_" + uuid).length) return

    const hl = _rangy.createHighlighter()
    const app = _rangy.createClassApplier("_" + uuid, applierOptions)
    hl.addClassApplier(app)

    let prepared: string
    if (serialized.startsWith(":~:text=")) {
      prepared = serialized // TODO: this is wrong
    } else {
      // Legacy deserialization
      prepared = prepare2deserialize(doc.body.textContent || "", serialized)
    }
    try {
      hl.deserialize(prepared)
    } catch { return }
  }

export const adjIdxs = (
  textContent: string,
  pre_post: string[],
  startIdx: number,
  endIdx: number,
  nToTake = 8,
): [number, number] => {
  const [pre, post] = pre_post
  const len = endIdx - startIdx
  const matches = (xfix: string) => Array.from(textContent.matchAll(RegExp(escapeRegExp(xfix), "gu")))
  const ss = matches(pre)
  const es = matches(post)

  const targetDiff = len - post.length
  // prettier-ignore
  const aligned = <T extends { index: number }>(left: T[], right: T[]): T[][] => {
    if (!left.length || !right.length) return []
    const [lf, ...lr] = left
    const [rf, ...rr] = right
    const diff = rf.index - lf.index
    if (diff / targetDiff > 1.1)
      // too far apart -> right too far -> only update left
      return aligned(lr, right)
    else if (diff / targetDiff < 0.9)
      // too close -> left too far -> only update right
      return aligned(left, rr)
    else return [[lf, rf], ...aligned(lr, rr)]
  }

  const score = (l: RegExpExecArray, r: RegExpExecArray) =>
    (1 + Math.abs(r.index - l.index - targetDiff)) * Math.abs(l.index - startIdx)
  const allAligned = aligned(ss, es).toSorted(desc(([l, r]) => -score(l, r)))
  if (allAligned.length) {
    // TODO: here I changed
    const [l, r] = allAligned[0]
    return [l.index, r.index + post.length]
  } else if (nToTake == 0) {
    return [0, 0]
  } else {
    return adjIdxs(textContent, pre_post, startIdx, endIdx, nToTake - 1)
  }
}

