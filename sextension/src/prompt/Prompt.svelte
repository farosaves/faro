<script lang="ts">
  import { closeSavePrompt } from "$lib/chromey/messages"
  import { createTRPCProxyClient } from "@trpc/client"
  import { altKey, funLog } from "shared"
  import type { AppRouter } from "../background"
  import { chromeLink } from "trpc-chrome/link"
  import { currTab } from "$lib/utils"
  const iconUrl = chrome.runtime.getURL("./icon.svg")
  // let hidden = false
  const close = async () => closeSavePrompt.send(true, { tabId: (await currTab()).id })
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port })],
  })
</script>

<div class="flex bg-base-100 items-center justify-between h-24">
  <div class="place-content-center grow-0">
    <img src={iconUrl} style="height: 3rem; width: 3rem" alt="Faro icon" />
  </div>
  <h3 class="text-xl grow-0 text-center">
    Hey! <br />Why not save it with
    <a href="https://farosaves.com" class="underline text-yellow-100">Faro</a>?
  </h3>
  <ul class="flex-grow">
    <li class="text-lg text-center">Find a sentence that'd help you remember it</li>
    <li class="text-lg text-center">Highlight it and save with {altKey} + X</li>
  </ul>
  <!-- <div class="flex w-full justify-around my-2"> -->
  <button
    class="btn m-1"
    on:click={() => {
      close()
      TB.toggleNoPrompt.mutate()
    }}>Don't show again</button>
  <button class="btn btn-primary m-1" on:click={close}>Thanks!</button>
  <!-- </div> -->
</div>
