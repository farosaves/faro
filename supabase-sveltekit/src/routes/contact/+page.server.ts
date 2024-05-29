import { trpc } from "$lib/trpc/client"
import { API_ADDRESS } from "shared"

const T = trpc({ url: { origin: API_ADDRESS } })

export const actions = {
  default: async ({ request }) => {
    const fdata = (await request.formData())
    console.log(fdata)
    const message = fdata.get("message")!.toString()
    T.featRequest.mutate(message)
    return { success: !!message.length }
  },
}

