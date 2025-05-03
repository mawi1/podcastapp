<script lang="ts">
  import type { Snippet } from "svelte";

  import RangeInput from "./RangeInput.svelte";

  type Props = {
    children: Snippet;
    value: number;
    min?: number;
    max?: number;
    step?: string;
    onchange?: () => void;
  };

  let { children, value = $bindable(), min, max, step, onchange }: Props = $props();
  let overlayOpen = $state(false);
</script>

<div class="hidden max-w-28 flex-col items-center @min-[430px]:flex">
  <div class="font-bold">{@render children()}</div>
  <RangeInput bind:value {min} {max} {step} {onchange} />
</div>
<div class="@min-[430px]:hidden">
  <button
    onclick={() => {
      overlayOpen = true;
    }}
    class="size-12 font-bold">{@render children()}</button
  >
  <div
    class:hidden={!overlayOpen}
    class="z-900 absolute left-0 top-0 bg-neutral-800/88 w-full h-full min-[672px]:rounded-[0.250rem] flex items-center justify-center"
  >
    <button
      onclick={() => {
        overlayOpen = false;
      }}
      aria-label="close"
      class="flex justify-center items-center rounded-full absolute right-2.5 top-2.5 size-10 bg-neutral-600"
    >
      <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="w-35">
      <div class="flex justify-center font-bold">{@render children()}</div>
      <RangeInput bind:value {min} {max} {step} {onchange} />
    </div>
  </div>
</div>
