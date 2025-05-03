<script lang="ts">
  import FormInput, { type FormInputProps } from "$lib/components/FormInput";
  import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "$lib/constants";

  import Label from "../../lib/components/Label.svelte";

  let {
    value = $bindable(),
    showHints = false,
    ...props
  }: { value?: string; showHints?: boolean } & FormInputProps = $props();

  let showPassword = $state(false);
  let touched = $state(false);
</script>

<div class="flex justify-between">
  <Label for="password">Password</Label>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span
    class="mb-2 block cursor-pointer text-sm"
    onclick={() => {
      showPassword = !showPassword;
    }}
  >
    {#if showPassword}
      <i class="fa-regular fa-eye-slash mr-1"></i>Hide
    {:else}
      <i class="fa-regular fa-eye mr-1"></i>Show
    {/if}
  </span>
</div>
<FormInput
  {...props}
  id="password"
  name="password"
  type={showPassword ? "text" : "password"}
  required
  bind:value
  onfocus={() => {
    touched = true;
  }}
></FormInput>
{#if touched && showHints}
  <ul class="mt-1 list-inside list-disc">
    <li>{PASSWORD_MIN_LENGTH} characters minimum</li>
    <li>{PASSWORD_MAX_LENGTH} characters maximum</li>
  </ul>
{/if}
