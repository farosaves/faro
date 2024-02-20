<script lang="ts">
  let files: FileList;
  $: files && console.log("less than 10 MB?", files[0].size < Math.pow(10, 7));
</script>

<div class="flex justify-center">
  <div></div>
</div>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="text-center lg:text-left">
      <h1 class="text-5xl font-bold">Upload PDF</h1>
      <p class="py-6">
        It will be converted to a webpage so that highlighting will work.
      </p>
    </div>
    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
      <form method="post" class="card-body" enctype="multipart/form-data">
        <input
          type="file"
          accept=".pdf"
          name="fileToUpload"
          required
          bind:files
          class="file-input file-input-bordered w-full max-w-xs" />
        <button disabled={!files} class="btn" type="submit">Upload</button>
      </form>
    </div>
  </div>
</div>
