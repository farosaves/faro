<script>
  import { altKey } from "shared"
  const iconUrl = chrome.runtime.getURL("./icon.svg")
  // let hidden = false
</script>

<div class="flex bg-base-100 items-center justify-between h-24">
  <div class="place-content-center grow-0">
    <img src={iconUrl} style="height: 3rem; width: 3rem" alt="Faros icon" />
  </div>
  <h3 class="text-xl grow-0 text-center">
    Hey! <br />Why not save it with
    <a href="https://farosapp.com" class="underline text-yellow-100">Faros</a>?
  </h3>
  <ul class="flex-grow">
    <li class="text-lg text-center">Find a sentence that'd help you remember it</li>
    <li class="text-lg text-center">Highlight it and save with {altKey} + D</li>
  </ul>
  <!-- <div class="flex w-full justify-around my-2"> -->
  <button class="btn m-1">Don't show again</button>
  <button class="btn btn-primary m-1">Thanks!</button>
  <!-- </div> -->
</div>
