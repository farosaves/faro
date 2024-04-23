import { trpc } from "$lib/trpc/client"
import { API_ADDRESS, logIfError } from "shared"

const T = trpc({ url: { origin: API_ADDRESS } })

export const actions = {
  default: async ({ request }) => {
    const fdata = (await request.formData())
    console.log(fdata)
    const email = fdata.get("email")!.toString()
    T.emailToList.mutate(email).then(logIfError("add Email"))
    return { success: !!email.length }
  },
}

