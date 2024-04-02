import { initTRPC } from "@trpc/server"

export const createContext = (ctx: { req: { sender: chrome.runtime.MessageSender } }) => ({ tab: ctx.req.sender.tab })
type Context = ReturnType<typeof createContext>
export const t = initTRPC.context<Context>().create({
  isServer: false,
  allowOutsideOfServer: true,
})

