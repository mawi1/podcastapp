<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="flex flex-col mt-3 p-3 border rounded-[0.250rem] border-zinc-300">
  {@render children()}
</div>
