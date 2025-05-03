<script lang="ts">
  import type { Snippet } from "svelte";

  import { enhance } from "$app/forms";

  import Button, { ButtonType } from "$lib/components/Button";
  import Error from "$lib/components/Error.svelte";
  import Label from "$lib/components/Label.svelte";

  let {
    title,
    username_input,
    password_input,
    disabled,
    error,
    showRegisterLink = false,
  }: {
    title: string;
    username_input: Snippet;
    password_input: Snippet;
    disabled: boolean;
    error?: string;
    showRegisterLink?: boolean;
  } = $props();
</script>

<div class="w-full max-w-sm rounded-md min-[440px]:border p-4 min-[360px]:p-8 border-zinc-300">
  <h1 class="py-5 text-center">{title}</h1>
  {#if error}
    <Error text={error} />
  {/if}
  <form method="POST" class="" use:enhance>
    <div class="mb-5">
      <Label for="username">Username</Label>
      {@render username_input()}
    </div>
    <div class="mb-5">
      {@render password_input()}
    </div>
    <div class="">
      <Button type="submit" class="w-full" btnType={ButtonType.Primary} {disabled}>{title}</Button>
    </div>
  </form>
  {#if showRegisterLink}
    <p class="mt-5 text-center">
      No account yet? <a class="hyperlink" href="/register">Register here</a>
    </p>
  {/if}
</div>
