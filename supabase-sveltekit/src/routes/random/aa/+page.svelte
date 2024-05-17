<button popovertarget="farospopover">Toggle the popover</button>

<div id="farospopover" popover="auto">
  <h3 class="popovertitle">
    Hey! Why not save it with <a href="https://farosapp.com" class="underline">Faros</a>?
  </h3>
  <ul>
    <li>Try to find a sentence which will make it easier for you to remember it</li>
    <li>Then save it with Alt/Option + D</li>
    <li>You can always export it to bookmarks later so why not!</li>
  </ul>
  <div class="flex w-full justify-around my-2">
    <button class="btn btn-sm" popovertarget="farospopover">Don't show again</button>
    <button id="thanks" class="btn btn-sm btn-primary" popovertarget="farospopover">Thanks!</button>
  </div>
</div>

<style>
  #thanks {
    height: 2rem;
    min-height: 2rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-size: 0.875rem;
    background-color: oklch(0.6177 0.163 307.59);
    border-radius: 0.5rem;
    font-weight: 600;
  }
  #farospopover {
    text-align: center;
    /* border-collapse: separate; */
    background-color: #0b1533;
    border-radius: 2rem;
    padding: 0.5rem;
    color: aliceblue;
  }
  .popovertitle {
    font-size: larger;
    color: #fef9c3;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .underline {
    text-decoration-line: underline;
  }
</style>
