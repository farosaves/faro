<script lang="ts">
  import { onMount } from "svelte";
  import * as rangy from "rangy";
  // import createHighlighter from "./rangy-classapplier.min.js";

  let loaded = false;

  onMount(() => {
    loaded = true;
    let ran2sel = (rann: Range) => {
      let sel = rangy.getSelection();
      sel.setSingleRange(rann as RangyRange);
      return sel;
    };
    document.body.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        let rann = document.getSelection()?.getRangeAt(0)!;
      }
    });
  });
</script>

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
