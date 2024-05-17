<!-- <script lang="ts">
  import { createTRPCProxyClient, loggerLink } from "@trpc/client"
  import { chromeLink } from "trpc-chrome/link"
  import type { AppRouter } from "../background"
  import { checkGoto, gotoNoSuccess } from "$lib/chromey/messages"
  import { funLog } from "shared"
  import { firstValueFrom } from "rxjs"
  import { trpc2 } from "$lib/trpc-client"
  import type { UUID } from "crypto"
  const T2 = trpc2()

  const port = chrome.runtime.connect()
  const T = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port }), loggerLink()],
  })
  const accept = async () => {
    const perm = { permissions: ["pageCapture"] }
    if (!(await chrome.permissions.contains(perm))) chrome.permissions.request(perm)
    // 'loading circle & this window will close if succesful'
    // open the tab
    const urlParams = new URLSearchParams(window.location.search)
    const id = (urlParams.get("id") || "") as UUID
    const note = await T.singleNoteLocal.query(id)
    const tab = await chrome.tabs.create({
      url: (note?.url || "") + "?highlightUuid=" + (note?.snippet_uuid || ""),
      active: false, // dont open it!
    })
    await T.tab4Check.mutate(tab.id!)
    const [noSuccess, _] = await firstValueFrom(gotoNoSuccess.stream) // yet
    funLog("accept f")(noSuccess)
    if (!noSuccess) {
      const blob = await chrome.pageCapture.saveAsMHTML({ tabId: tab.id! })
      if (!blob) throw new Error("bloob:(")
      // T2.uploadMHTML.mutate({ id, data: await blob.text() })

      // either save this or call mhtml2html here
    }
  }
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">We have a problem</h1>
      <p class="py-6">
        The page didn't load properly. <br /> You either need to be logged in or it doesn't render properly on
        our server. <br /> If it works on your browser, you can upload a <i>copy</i> of how the page loads for
        you, so it will be rendered the same for whoever has the link.
      </p>
      <div role="alert" class="alert">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-info shrink-0 w-6 h-6"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path
          ></svg>
        <div>
          <h3 class="font-bold">Do you wish to upload your copy?</h3>
          <div class="text-s">Make sure there's no password or sensitive information on the page!</div>
        </div>

        <div>
          <button class="btn btn-sm" on:click={() => T.closeMe.query()}>Deny</button>
          <button class="btn btn-sm btn-primary" autofocus on:click={accept}>Accept</button>
        </div>
      </div>
    </div>
  </div>
</div> -->
