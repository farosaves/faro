<script lang="ts">
  export let data;
  $: user_email = data.session?.user.email;
  import { get } from "svelte/store";
  import { formula } from "svelte-formula";
  import { logIfError } from "$lib/shared/utils.js";
  import { goto } from "$app/navigation";

  const { form, formValidity, isFormValid, submitValues, touched, validity } =
    formula({
      formValidators: {
        // @ts-ignore
        passwordsMatch: (values: {
          password: string;
          passwordMatch: string;
        }) =>
          values.password === values.passwordMatch
            ? null
            : "Your passwords must match",
      },
    });

  $: passwordErr = $touched?.password && $validity?.password?.invalid;
  $: passwordsMatchErr =
    $touched.passwordMatch && $formValidity?.passwordsMatch;

  function onSubmit() {
    const { password } = get(submitValues);
    data.supabase.auth
      // @ts-ignore
      .updateUser({ password })
      .then(logIfError)
      .then(() => goto("/account"));
  }
</script>

<div class="">
  <div>
    User email: {user_email}
  </div>
  <form use:form id="signup" on:submit={onSubmit} class="flex flex-col w-96">
    <div hidden={$isFormValid}>There are errors</div>

    <div class="form-field">
      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        minlength="8"
        class:error={passwordErr} />
      <span hidden={!passwordErr}>{$validity?.password?.message}</span>
    </div>
    <div class="form-field">
      <label for="passwordMatch">Password Match</label>
      <input
        type="password"
        id="passwordMatch"
        name="passwordMatch"
        required
        minlength="8"
        class:error={passwordsMatchErr} />
      <span hidden={!passwordsMatchErr}>{$formValidity?.passwordsMatch}</span>
    </div>
    <button
      class="btn btn-primary self-center"
      type="submit"
      disabled={!$isFormValid}>Reset password</button>
  </form>
</div>

<style>
  .error {
    border: 1px solid red;
  }
</style>
