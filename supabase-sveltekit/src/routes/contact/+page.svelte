<script lang="ts">
  import IconEnvelope from "~icons/jam/envelope"
  import IconWrench from "~icons/jam/wrench"
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center text-2xl flex-col">
    Send any email:
    <div class="flex">
      <IconEnvelope /><a href="mailto:pawel@farosapp.com">pawel@farosapp.com</a>
    </div>
    <div class="divider"></div>
    Suggest feature:
    <form method="POST">
      <label class="input input-bordered flex items-center gap-2">
        <inp ut name="message" class="grow" placeholder="e.g. firefox pls" />
        <button type="submit"><IconWrench /></button>
      </label>
    </form>
    <a href="/roadmap" class="underline text-lg">Find here planned features</a>
    <div class="divider"></div>
    <a href="/contact/issue">Report an issue</a>
  </div>
</div>
