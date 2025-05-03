<script lang="ts">
  import type { FormInputProps } from ".";
  import InputBase from "../InputBase.svelte";

  let {
    valid,
    isLoading = false,
    helperText,
    value = $bindable(),
    ...props
  }: FormInputProps = $props();
</script>

<div class="relative">
  <InputBase {...props} class="w-full" bind:value />
  {#if valid === true && !isLoading}
    <i class="fa-regular fa-circle-check absolute right-2 top-[50%] -translate-y-1/2"></i>
  {/if}
  {#if valid === false && !isLoading}
    <i class="fa-regular fa-circle-xmark absolute right-2 top-[50%] -translate-y-1/2"></i>
  {/if}
  {#if isLoading === true}
    <div class="absolute right-2 top-[50%] -translate-y-1/2">
      <i class="fa-solid fa-spinner animate-spin"></i>
    </div>
  {/if}
</div>
{#if helperText}
  <p class="mt-1">{helperText}</p>
{/if}
