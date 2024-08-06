<script lang="ts">
  import IconWrench from "~icons/jam/wrench"
</script>

<div class="hero h-screen-minus-80">
  <div
    class="hero-content text-center text-2xl flex-col border border-primary rounded-box bg-base-100 bg-opacity-30">
    Send any email:
    <div class="flex">
      <a href="mailto:pawel@farosaves.com">pawel@farosaves.com</a>
    </div>
    <div class="divider"></div>
    Suggest a feature:
    <form method="POST">
      <label class="input input-bordered flex items-center gap-2">
        <input name="message" class="grow" placeholder="e.g. firefox pls" />
        <button type="submit"><IconWrench /></button>
      </label>
    </form>
    <!-- <a href="/roadmap" class="underline text-lg">Find here planned features</a> -->
    <div class="divider"></div>
    <a href="/contact/issue">Report an issue</a>
  </div>
</div>
