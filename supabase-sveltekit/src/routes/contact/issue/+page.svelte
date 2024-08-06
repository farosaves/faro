<script lang="ts">
  import IconEnvelope from "~icons/jam/envelope"
  //   import IconWrench from "~icons/jam/wrench"
</script>

<div class="hero h-screen-minus-80">
  <div class="hero-content text-center text-2xl flex-col">
    <div class="collapse border-primary border hover:text-primary">
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium text-center p-4">Currently known issues</div>
      <ul class="collapse-content mx-4 text-lg list-disc text-nowrap w-min text-left text-base-content">
        <!-- <li>Not highlighting on pubmed</li> -->
        <li>Reddit usually doesn't highlight</li>
        <li>YT video titles don't highlight</li>
        <li>Table data not formatted correctly</li>
      </ul>
    </div>
    Found a new one? Email:
    <div class="flex">
      <IconEnvelope /><a href="mailto:pawel@farosaves.com">pawel@farosaves.com</a>
    </div>
  </div>
</div>
