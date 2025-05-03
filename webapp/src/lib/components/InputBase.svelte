<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { twMerge } from "tailwind-merge";

  let { value = $bindable(), class: className, ...props }: HTMLInputAttributes = $props();
  const inputClass = $derived(
    twMerge(
      "appearance-none rounded border border-zinc-300 px-3 py-2 leading-tight text-neutral-700 focus:outline-none",
      className
    )
  );
</script>

<input {...props} bind:value class={inputClass} />
