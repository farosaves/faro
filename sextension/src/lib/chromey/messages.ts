import type { PendingNote } from "$lib/utils"
import { getMessage } from "@extend-chrome/messages"

const gmWrap = <T>(s: string) => {
  type Constr<T> = (value: [T, chrome.runtime.MessageSender]) => void

  const [send, stream, wait] = getMessage<T>(s)
  return { send, stream, wait, sub: <A extends Constr<T>>(x: A) => stream.subscribe(x) }
}

export const pendingNotes = gmWrap<PendingNote>("STATS")

export const loadDeps = gmWrap<void>("load deps")
