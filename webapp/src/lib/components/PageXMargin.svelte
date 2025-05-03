<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="mx-3 min-[375px]:mx-4 min-[704px]:mx-0">
  {@render children()}
</div>
