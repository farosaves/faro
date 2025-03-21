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

  const startPosition = fullText.indexOf(text)

  if (startPosition === -1 || numOccurrence === 0) {
    return `:~:text=${textStartEnd}`
  }

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

/**
 * Extracts the start and end indices from a text fragment
 * @param fragment The text fragment
 * @param testBody Optional HTML body element for testing
 */
export const textFragmentToIndices = (fragment: string, testBody?: HTMLElement): [number, number] => {
  const textMatch = fragment.match(/:~:text=(?:(.*?)-,)?([^,]+)(?:,-(.*))?/)
  if (!textMatch) return [0, 0]

  const [_, prefix, mainText, suffix] = textMatch

  // Decode the components
  const decodedMainText = decodeURIComponent(mainText || "")
  const decodedPrefix = prefix ? decodeURIComponent(prefix) : ""
  const decodedSuffix = suffix ? decodeURIComponent(suffix) : ""

  if (!decodedMainText) return [0, 0]

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
    return [0, decodedMainText.length]
  }

  // Strategy 1: Use prefix and suffix if available
  if (decodedPrefix && decodedSuffix) {
    const prefixIndex = fullText.indexOf(decodedPrefix)
    if (prefixIndex !== -1) {
      const startIndex = prefixIndex + decodedPrefix.length
      const textAfterPrefix = fullText.substring(startIndex)
      if (textAfterPrefix.startsWith(decodedMainText)) {
        return [startIndex, startIndex + decodedMainText.length]
      }
    }
  }

  // Strategy 2: Just find the main text
  const textIndex = fullText.indexOf(decodedMainText)
  if (textIndex !== -1) {
    return [textIndex, textIndex + decodedMainText.length]
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

