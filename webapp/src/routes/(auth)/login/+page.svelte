<script lang="ts">
  import FormInput from "$lib/components/FormInput/FormInput.svelte";

  import AuthForm from "../AuthForm.svelte";
  import PasswordInput from "../PasswordInput.svelte";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();

  let username: string = $state("");
  let isUsernameTouched = $state(false);
  let isUsernameValid = $derived(
    !isUsernameTouched && username.length === 0 ? undefined : username.length > 0
  );
  let usernameHelperText = $derived(
    username.length === 0 && isUsernameTouched ? "Username is required" : undefined
  );

  let password: string = $state("");
  let isPasswordTouched = $state(false);
  let isPasswordValid = $derived(
    !isPasswordTouched && password.length === 0 ? undefined : password.length > 0
  );
  let passwordHelperText = $derived(
    password.length === 0 && isPasswordTouched ? "Password is required" : undefined
  );

  let btnDisabled = $derived(!isUsernameValid || !isPasswordValid);
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<AuthForm title="Login" disabled={btnDisabled} showRegisterLink={true} error={form?.error}>
  {#snippet username_input()}
    <FormInput
      id="username"
      name="username"
      bind:value={username}
      valid={isUsernameValid}
      helperText={usernameHelperText}
      oninput={() => {
        isUsernameTouched = true;
      }}
    />
  {/snippet}
  {#snippet password_input()}
    <PasswordInput
      bind:value={password}
      valid={isPasswordValid}
      helperText={passwordHelperText}
      oninput={() => {
        isPasswordTouched = true;
      }}
    />
  {/snippet}
</AuthForm>
