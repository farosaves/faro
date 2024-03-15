<script lang="ts">
  // import { pipeline } from '@xenova/transformers';
  import { onMount } from "svelte"
  import { Observable, fromEvent, map, Subject } from "rxjs"
  import fuzzysort from "fuzzysort"
  import * as tok from "sbd"
  import { writable, type Subscriber } from "svelte/store"
  import { flow } from "fp-ts/lib/function"

  let alltext: string[]
  let mousePosition: Observable<{ x: number; y: number }> | null = null
  const Sub = new Subject<string>()
  // const toObservable = (store) => new Observable((observer) => store.subscribe(observer.next))
  // const ff = query.subscribe(x)
  // console.log(ff)

  Sub.forEach(console.log)
  const toStore = <T,>(Sub: Observable<T>, init: T) => {
    const store = writable(init)
    Sub.subscribe(store.set)
    return store
  }
  const query = toStore(Sub, "")
  let s: Subscriber<string>
  console.log(Sub.subscribe(() => {}))
  console.log(query.subscribe(() => {}))
  Sub.next("omg1")
  Sub.pipe(map((a) => a.length)).subscribe(console.log)

  // const O = toObservable(query)
  const obs = onMount(async () => {
    Sub.next("omg2")

    // document.getSelection()!.setBaseAndExtent(p, 0, p, p.childNodes.length);
    const x = await (await fetch("steg2.html")).text()

    let dom = new DOMParser().parseFromString(x, "text/html")

    // alltext = dom.body.innerText.replaceAll(/(\s*\n\s*)+/gm, '\n');
    alltext = dom.body.innerText
      .split("\n")
      .map((s) => s.trim())
      .filter((x) => x.split(" ").length > 0)
      .map((s) => tok.sentences(s))
      .flat()
    // console.log(alltext)

    const mousePosition = fromEvent<MouseEvent>(document, "click").pipe(
      map((event) => ({ x: event.clientX, y: event.clientY })),
    )
    // console.log()
    // mousePosition.forEach(console.log)
    mousePosition.subscribe(flow(JSON.stringify, query.set))
  })

  // Change the pattern
  const pattern = "yoga home"

  let res = ""
  let f = () => {
    const x = fuzzysort.go($query, alltext, { limit: 5 })
    res = x.map((x) => fuzzysort.highlight(x, '<b class="text-yellow-300"">', "</b>")).join("<br/><br/>")
    // console.log(x.map((x) => x.score));
  }
  // console.log(O)
  // console.log($O)
  let a = 0
</script>

<p id="p">Select me: <i>italic</i> and <b>bold</b></p>
<input bind:value={$query} on:keyup={f} />
<button class="btn" on:click={() => Sub.next((a += 1).toString())}>aa</button>
<br />
{@html res}
<!-- {mousePosition}
{#if mousePosition !== null}
  {#key mousePosition}
    heh
  {/key}
{/if} -->
