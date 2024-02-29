<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import type { Notes } from "../dbtypes";
  import type { NoteSync } from "./note-sync";
  import { onMount } from "svelte";
  import { sleep, themeStore } from "./utils";
  import MyTags from "./MyTags.svelte";
  export let note_data: Notes;
  export let showing_content: boolean;
  export let close_all_notes: () => void;
  export let note_sync: NoteSync;
  export let goto_function: MouseEventHandler<any> | undefined;

  let this_element: Element;
  $: tags = note_data.tags || [];
  let all_tags = note_sync.alltags();
  $: replacer = (capture: string) =>
    `<b class="${$themeStore == "dark" ? "text-yellow-100" : ""}">` +
    capture +
    `</b>`;
  let escapeHTML = (text: string) => {
    var div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  };

  $: text = note_data.highlights
    ? escapeHTML(note_data.quote).replaceAll(note_data.highlights[0], replacer)
    : escapeHTML(note_data.quote);

  $: onTagAdded = note_sync.tagUpdate(note_data);
  $: onTagRemoved = note_sync.tagUpdate(note_data);

  let highlighting = false;
  const highlightMe = () => {
    this_element.scrollIntoView({ block: "center" });
    highlighting = true;
    setTimeout(() => (highlighting = false), 1000);
    return true;
  };
  onMount(() => {
    "highlightOnMount" in note_data &&
      note_data["highlightOnMount"] &&
      highlightMe() &&
      (note_data["highlightOnMount"] = false);
  });
</script>

<div
  class="collapse bg-base-200 border-primary"
  style="border-width: {1 + 5 * +highlighting}px;">
  <input type="checkbox" class="-z-10" bind:checked={showing_content} />
  <div
    class="collapse-title text-center"
    bind:this={this_element}
    style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1">
    <button
      on:click={async () => {
        const save_showing_content = showing_content;
        close_all_notes();
        // svelte stores....
        await sleep(1);
        showing_content = !save_showing_content;
      }}
      on:dblclick={goto_function}>
      {@html text}
    </button>
    <span>
      <MyTags bind:tags autoComplete={$all_tags} {onTagAdded} {onTagRemoved} />
    </span>
  </div>
  <div class="collapse-content z-40" style="grid-row-start: 2">
    <div class="join w-full">
      <!-- <button class="btn btn-xs join-item grow" on:click={() => {}}>
        Pin / Unpin</button> -->
      <button
        class="btn btn-xs join-item grow"
        style="color: red;"
        on:click={() => {
          note_sync.deleteit(note_data);
          close_all_notes();
        }}>DELETE</button>
    </div>
  </div>
</div>
