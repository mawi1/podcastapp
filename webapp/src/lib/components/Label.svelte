<script lang="ts">
  import type { HTMLLabelAttributes } from "svelte/elements";

  const { children, ...others }: HTMLLabelAttributes = $props();
</script>

<label {...others} class="mb-2 block text-sm font-bold text-gray-700">
  {#if children}
    {@render children()}
  {/if}
</label>
