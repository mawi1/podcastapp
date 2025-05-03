<script>
  import PageXMargin from "$lib/components/PageXMargin.svelte";

  let { children } = $props();
</script>

<PageXMargin>
  {@render children()}
</PageXMargin>
