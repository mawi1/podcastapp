<script lang="ts">
  import debounce from "lodash/debounce";

  import FormInput from "$lib/components/FormInput/FormInput.svelte";
  import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH } from "$lib/constants";
  import { trpc } from "$lib/trpc/client";

  import AuthForm from "../AuthForm.svelte";
  import PasswordInput from "../PasswordInput.svelte";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();

  let username = $state.raw("");
  let isUsernameFieldLoading = $state(false);
  let isUsernameValid: undefined | boolean = $state(undefined);
  let usernameHelperText: string | undefined = $state(undefined);

  const checkUsername = debounce(async (u: string) => {
    isUsernameFieldLoading = true;
    const r = await trpc().isUsernameAvailable.query({ username: u });
    isUsernameFieldLoading = false;
    if (username === r?.username) {
      if (r!.isAvailable) {
        usernameHelperText = undefined;
        isUsernameValid = true;
      } else {
        usernameHelperText = "Username not available.";
        isUsernameValid = false;
      }
    }
  }, 500);

  const handleUsernameInput = async (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (value.length === 0) {
      usernameHelperText = "Username is required.";
      isUsernameValid = false;
      return;
    }
    if (value.length > USERNAME_MAX_LENGTH) {
      usernameHelperText = `The maximum length is ${USERNAME_MAX_LENGTH}.`;
      isUsernameValid = false;
      return;
    }
    usernameHelperText = undefined;
    isUsernameValid = undefined;
    await checkUsername(value);
  };

  let wasPasswordValidOnce = $state(false);
  let isPasswordValid: boolean | undefined = $state(undefined);

  const handlePasswordInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    const isValid = value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
    if (!isValid && !wasPasswordValidOnce) {
      isPasswordValid = undefined;
    } else {
      isPasswordValid = isValid;
    }
    if (isValid) {
      wasPasswordValidOnce = true;
    }
  };
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<AuthForm title="Register" disabled={!isUsernameValid || !isPasswordValid} error={form?.error}>
  {#snippet username_input()}
    <FormInput
      id="username"
      name="username"
      bind:value={username}
      oninput={handleUsernameInput}
      valid={isUsernameValid}
      helperText={usernameHelperText}
      isLoading={isUsernameFieldLoading}
    />
  {/snippet}
  {#snippet password_input()}
    <PasswordInput valid={isPasswordValid} showHints={true} oninput={handlePasswordInput} />
  {/snippet}
</AuthForm>
