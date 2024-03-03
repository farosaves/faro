<script lang="ts">
  export let data;
  import { form, field } from "svelte-forms";
  import { matchField, required, pattern } from "svelte-forms/validators";
  const opt = { checkOnInit: true };
  const password = field("password", "", [required(), pattern(/.{8,30}/)], opt);
  const passwordConf = field("passwordConf", "", [matchField(password)], opt);
  const myForm = form(password, passwordConf);
  import { onMount } from "svelte";
  import { logIfError } from "$lib/shared/utils";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  const isNew = $page.url.searchParams.has("new");

  onMount(() => {
    myForm.validate();
  });
  let errors = { pat: "", match: "" };
  const optEr = (err: string, msg: string) =>
    $myForm.dirty && $myForm.hasError(err) ? msg : "";
  $: if (myForm && $myForm.dirty)
    errors = {
      pat: optEr("password.pattern", "8 to 30 characters please."),
      match: optEr("passwordConf.match_field", "They need to match"),
    };

  const submit = () =>
    data.supabase.auth
      // @ts-ignore
      .updateUser({ password: $password.value })
      .then(logIfError)
      .then(() => goto("/account"));
</script>

{$myForm.dirty}
<!-- <Auth fields={[password, passwordConf]} /> -->

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="text-center lg:text-left">
      <h1 class="text-5xl font-bold">{isNew ? "Set" : "Reset"} Password</h1>
      <p class="py-6">
        <!-- {isNew ? ""} -->
      </p>
    </div>
    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
      <form class="card-body" on:submit={submit}>
        <div class="form-control">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span class="label-text">Password</span>
            <span class="text-error text-sm text-center">{errors.pat}</span>
          </label>
          <input
            type="password"
            class="input input-bordered"
            bind:value={$password.value}
            required />
        </div>
        <div class="form-control">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span class="label-text">Repeat password</span>
            <span class="text-error text-sm text-center">{errors.match}</span>
          </label>
          <input
            type="password"
            class="input input-bordered"
            required
            bind:value={$passwordConf.value} />
          <!-- <label class="label">
            <a href="#" class="label-text-alt link link-hover"
              >Forgot password?</a>
          </label> -->
        </div>
        <div class="form-control mt-6">
          <button disabled={!$myForm.valid} class="btn btn-primary"
            >Submit</button>
        </div>
      </form>
    </div>
  </div>
</div>
