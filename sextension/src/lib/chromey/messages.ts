import type { PendingNote } from "$lib/utils"
import { getMessage } from "@extend-chrome/messages"

const gmWrap = <T>(s: string) => {
  const [send, stream, wait] = getMessage<T>(s)
  return { send, stream, wait }
}
export const pendingNotes = gmWrap<PendingNote>("STATS")

export const [sendReady, readyStream, waitForReady] = getMessage<void>("READY")
