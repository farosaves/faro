<script>
  import { Icon, PencilSquare } from "svelte-hero-icons"
  import AnswerButton from "./AnswerButton.svelte"
  let editing = false
  let show_prev_sentence = false
  let show_next_sentence = false
  let showing_answer = false
</script>

<div
  class="relative mx-auto max-w-xl rounded-lg border border-gray-700 bg-black p-6 text-white space-y-4"
>
  <!-- <div class="absolute right-4 top-4">
    <div class="group">
      Italic 'i' within a circle
      <span
        class="material-icons flex cursor-pointer items-center justify-center rounded-full border border-white italic"
        style="width: 24px; height: 24px">i</span
      >
      <div
        class="absolute right-0 z-10 w-40 rounded-lg bg-gray-700 p-4 text-xs opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
      >
        Source:
        <a
          href="https://en.m.wikipedia.org/wiki/2023_Booker_Prize"
          class="underline"
          target="_blank"
          rel="noopener noreferrer"
          >https://en.m.wikipedia.org/wiki/2023_Booker_Prize</a
        ><br />
        Captured: 2023-12-23
      </div>
    </div>
  </div> -->
  <h3 class="mb-4 border-b border-gray-600 pb-2 text-lg font-semibold">
    My Deck
  </h3>
  <div class="flex flex-col space-y-4">
    <div class="textarea textarea-bordered text-center">
      <div class="flex">
        <button class="opacity-0" disabled>
          <Icon src={PencilSquare} size="32" />
        </button>
        <a
          href="https://en.wikipedia.org/wiki/Chick_flick"
          class="text-2xl hover:underline flex-1"
          target="_blank">Chick Flick</a
        ><br />
        <button
          on:click={() => {
            editing = !editing
          }}
        >
          <!--  @click="editing=!editing" -->
          <Icon src={PencilSquare} size="32" />
        </button>
      </div>

      <span contenteditable={editing}>
        <h3 class="text-lg" contenteditable="false">Definitions</h3>
        {#if show_prev_sentence}
          Defining a chick flick is, as The New York Times has stated, more of a
          parlor game than a science.
        {:else}
          <span
            class="hover:underline"
            on:click={() => (show_prev_sentence = true)}>[...]</span
          >
        {/if}
        <br />

        These films are generally held in popular culture as having
        <b class="text-yellow-400" v-if="!show">???</b><i
          class="text-yellow-400"
          v-if="show">formulaic</i
        >, paint-by-numbers plot lines and characters.<br />
        {#if show_next_sentence}
          This makes usage of the term "problematic" for implying "frivolity,
          artlessness, and utter commercialism", according to ReelzChannel.
        {:else}
          <span
            class="hover:underline"
            on:click={() => (show_next_sentence = true)}>[...]</span
          >
        {/if}
      </span>
    </div>
    <!-- <div class="flex justify-between items-center p-4 bg-gray-800 rounded">
          <span class="text-md font-medium">umsonst</span>
        </div> -->
  </div>
  <AnswerButton bind:showing_answer />
  {showing_answer}
</div>
