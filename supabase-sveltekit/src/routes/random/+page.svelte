<script lang="ts">
  // import { pipeline } from '@xenova/transformers';
  import { onMount } from "svelte";
  import fuzzysort from "fuzzysort";
  import * as tok from "sbd";

  import { SharedValue } from "shared";
  let alltext: string[];

  onMount(async () => {
    // document.getSelection()!.setBaseAndExtent(p, 0, p, p.childNodes.length);
    const x = await (await fetch("steg2.html")).text();

    let dom = new DOMParser().parseFromString(x, "text/html");

    // alltext = dom.body.innerText.replaceAll(/(\s*\n\s*)+/gm, '\n');
    alltext = dom.body.innerText
      .split("\n")
      .map((s) => s.trim())
      .filter((x) => x.split(" ").length > 0)
      .map((s) => tok.sentences(s))
      .flat();
    console.log(alltext);
  });

  let list = [
    "Yoga with Adriene - Revolution",
    "Brewdog beers",
    "NBA teams seen live",
    "Yoga with Adriene - DEDICATE - 30 days",
    "Yoga with Adriene - home",
  ];
  const options = {
    includeScore: true,
    shouldSort: true,
  };

  // Change the pattern
  const pattern = "yoga home";
  // console.log(fuzzysort.go(pattern, list));
  // console.log(fuse.search(pattern));
  // 2. Files import automatically: uncomment this
  // msg = capitalize(msg)

  // $('#header')
  // 	.html(msg)
  // 	// 3. Smart autocomplete: type .fadeIn('slow')
  // 	// after .fadeOut('slow')
  // 	.fadeOut(1000);
  // let f = async () => {
  // 	const answerer = await pipeline(
  // 		'question-answering',
  // 		'Xenova/distilbert-base-uncased-distilled-squad'
  // 	);
  // 	// const question = 'Who was Jim Henson?';
  // 	// const context = 'Jim Henson was a nice puppet.';
  // 	const question = 'What dinosaur preyed on stegosaurus?';
  // 	const output = await answerer(question, alltext[2]);
  // 	console.log(output);
  // };
  let query = "hmm";

  let res = "";
  let f = () => {
    const x = fuzzysort.go(query, alltext, { limit: 5 });
    res = x
      .map((x) =>
        fuzzysort.highlight(x, '<b class="text-yellow-300"">', "</b>"),
      )
      .join("<br/><br/>");
    // console.log(x.map((x) => x.score));
  };
</script>

{SharedValue}
<p id="p">Select me: <i>italic</i> and <b>bold</b></p>
<input bind:value={query} on:keyup={f} />
<button class="btn" on:click={() => {}}>aa</button>
<br />
{@html res}
