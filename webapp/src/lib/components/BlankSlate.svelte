<script lang="ts">
  import type { Snippet } from "svelte";

  const { children, title }: { children: Snippet; title?: string } = $props();
</script>

<div class="text-center mt-8">
  {#if title}
    <h3>{title}</h3>
  {/if}
  <p class="mt-2 text-base">{@render children()}</p>
</div>
