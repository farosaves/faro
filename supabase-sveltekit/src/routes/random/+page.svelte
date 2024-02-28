<script lang="ts">
  // import { pipeline } from '@xenova/transformers';
  import Fuse from "fuse.js";
  import { onMount } from "svelte";
  import fuzzysort from "fuzzysort";
  import * as tok from "sbd";

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

  const fuse = new Fuse(list, options);

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

<p id="p">Select me: <i>italic</i> and <b>bold</b></p>
<input bind:value={query} on:keyup={f} />
<button class="btn" on:click={() => {}}>aa</button>
<br />
{@html res}

<p>
  <i><b>Stegosaurus</b></i> (<span class="rt-commentedText nowrap"
    ><span class="IPA nopopups noexcerpt" lang="en-fonipa"
      ><a href="/wiki/Help:IPA/English" title="Help:IPA/English"
        >/<span style="border-bottom:1px dotted"
          ><span title="/ˌ/: secondary stress follows">ˌ</span><span
            title="'s' in 'sigh'">s</span
          ><span title="'t' in 'tie'">t</span><span title="/ɛ/: 'e' in 'dress'"
            >ɛ</span
          ><span title="/ɡ/: 'g' in 'guy'">ɡ</span><span
            title="/ə/: 'a' in 'about'">ə</span
          ><span title="/ˈ/: primary stress follows">ˈ</span><span
            title="'s' in 'sigh'">s</span
          ><span title="/ɔːr/: 'ar' in 'war'">ɔːr</span><span
            title="/ə/: 'a' in 'about'">ə</span
          ><span title="'s' in 'sigh'">s</span></span
        >/</a
      ></span
    ></span
  >;<sup id="cite_ref-2" class="reference"><a href="#cite_note-2">[2]</a></sup>
  <abbr style="font-size:85%" title="literal translation">lit.</abbr><span
    style="white-space: nowrap;">&thinsp;</span
  >'roof-lizard') is a genus of
  <a href="/wiki/Herbivorous" class="mw-redirect" title="Herbivorous"
    >herbivorous</a
  >, four-legged,
  <a href="/wiki/Armored_dinosaur" class="mw-redirect" title="Armored dinosaur"
    >armored dinosaur</a>
  from the
  <a href="/wiki/Late_Jurassic" title="Late Jurassic">Late Jurassic</a>,
  characterized by the distinctive kite-shaped upright
  <a href="/wiki/Osteoderm" title="Osteoderm">plates</a>
  along their backs and <a href="/wiki/Thagomizer" title="Thagomizer">spikes</a>
  on their tails. <a href="/wiki/Fossil" title="Fossil">Fossils</a> of the genus
  have been found in the western
  <a href="/wiki/United_States" title="United States">United States</a>
  and in <a href="/wiki/Portugal" title="Portugal">Portugal</a>, where they are
  found in <a href="/wiki/Kimmeridgian" title="Kimmeridgian">Kimmeridgian</a>-
  to <a href="/wiki/Tithonian" title="Tithonian">Tithonian</a>-aged
  <a href="/wiki/Strata" class="mw-redirect" title="Strata">strata</a>, dating
  to between 155 and 145&nbsp;<a
    href="/wiki/Mya_(unit)"
    class="mw-redirect"
    title="Mya (unit)">million years ago</a
  >. Of the species that have been classified in the upper
  <a href="/wiki/Morrison_Formation" title="Morrison Formation"
    >Morrison Formation</a>
  of the western US, only three are universally recognized:
  <i><b>S. stenops</b></i>, <i><b>S. ungulatus</b></i> and
  <i><b>S. sulcatus</b></i>. The remains of over 80 individual animals of this
  genus have been found. <i>Stegosaurus</i> would have lived alongside dinosaurs
  such as
  <i><a href="/wiki/Apatosaurus" title="Apatosaurus">Apatosaurus</a></i>,
  <i><a href="/wiki/Diplodocus" title="Diplodocus">Diplodocus</a></i>,
  <i><a href="/wiki/Camarasaurus" title="Camarasaurus">Camarasaurus</a></i>
  and <i><a href="/wiki/Allosaurus" title="Allosaurus">Allosaurus</a></i>, the
  latter of which may have preyed on it.
</p>
