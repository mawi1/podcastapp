<script lang="ts">
  import type { Snippet } from "svelte";

  import { formatDate } from "$lib/datetime";
  import type { PodcastBaseData } from "$lib/models";
  import { podcastPath } from "$lib/paths";

  import ListItem from "./ListItem.svelte";

  const { children, data }: { children?: Snippet; data: PodcastBaseData } = $props();
</script>

<ListItem>
  <h3><a href={podcastPath(data.id, data.title)}>{data.title}</a></h3>
  {#if data.latestEpisode}
    <div class="text-sm my-2 leading-none">Latest episode: {formatDate(data.latestEpisode)}</div>
  {/if}
  <div class="flex items-start">
    {#if children}
      {@render children()}
    {/if}
  </div>
</ListItem>
