<script lang="ts">
  import type { Cards } from "$lib/dbtypes.js";
  export let data;
  import { option as O, array as A } from "fp-ts";
  import { NoteSync } from "$lib/shared/note-sync.js";
  import { onMount } from "svelte";
  import Note from "$lib/components/Note.svelte";
  import { asc, filterSort } from "$lib/shared/utils.js";
  import type { NoteEx, Notess } from "$lib/shared/first.js";
  $: ({ supabase, session } = data);
  let user_id = O.fromNullable(session?.user.id);
  $: user_id = O.fromNullable(session?.user.id);
  type CardsNIds = (Cards & { card_contents: { note_id: number } })[];
  let pending_cards: CardsNIds = [];
  const note_sync = new NoteSync(supabase, undefined);
  import { derived, get, type Readable } from "svelte/store";
  import { flow, pipe } from "fp-ts/lib/function.js";
  import * as fd from "date-fns/fp";

  import LoginPrompt from "$lib/components/LoginPrompt.svelte";
  import { day, fromDay } from "./util.js";
  import { State } from "fsrs.js";

  let pending: { note: NoteEx; card: Cards }[] = [];
  $: {
    const m = new Map(
      pipe(
        get(note_sync.notestore),
        Object.entries,
        A.flatMap(([s, ns]) => ns as NoteEx[]),
        A.map((n) => [n.id, n] as [number, NoteEx]),
      ),
    );
    pending = pipe(
      pending_cards,
      A.map((c) => {
        return { card: c, note: m.get(c.card_contents.note_id) };
      }),
      A.filter(({ note }) => !!note),
      filterSort(({ card }) => Date.now() - Date.parse(card.due)),
    ) as { note: NoteEx; card: Cards }[];
    console.log(pending);
  }

  onMount(async () => {
    if (O.isSome(user_id)) {
      note_sync.user_id = user_id.value;
      let { data } = await supabase
        .from("cards")
        .select("*, card_contents (note_id, front, back)")
        .eq("user_id", user_id.value)
        .in("state", [State.Learning, State.Review])
        .lte("due", fromDay()(day()(Date.now())));
      pending_cards = data?.filter(
        (n) => !!n.card_contents?.note_id,
      ) as CardsNIds;
      pending_cards = pending_cards.toSorted(
        asc((x) => new Date(x.due).getTime()),
      );
    }
  });
  $: pending_cards = pending_cards.filter((x) => true); // here filter by not yet due
</script>

<LoginPrompt session={O.fromNullable(session)} />
{#each pending as { note, card }}
  <div class="flex flex-col items-center">
    <div class="w-min flex flex-col items-center">
      <Note
        note_data={note}
        showing_content={true}
        close_all_notes={() => {}}
        {note_sync} />
      <div class="flex w-full">
        <button class="btn flex-1" style="color: red">Pin</button>
        <button class="btn flex-1" style="color: white"></button>
        <button class="btn flex-1" style="color: green"></button>
        <button class="btn flex-1" style="color: blue"></button>
      </div>
    </div>
  </div>
{/each}
