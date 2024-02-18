<script lang="ts">
  import type { Cards } from "$lib/dbtypes.js";
  export let data;
  import { option as O } from "fp-ts";

  $: ({ supabase, session } = data);
  let user_id = O.fromNullable(session?.user.id);
  $: user_id = O.fromNullable(session?.user.id);
  let x: Cards[] = [];
  (async () => {
    if (O.isSome(user_id)) {
      let { data } = await supabase
        .from("cards")
        .select()
        .eq("user_id", user_id.value);
      x = data || [];
    }
  })();
</script>

{x.length}
