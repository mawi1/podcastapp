<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  import BlankSlate from "$lib/components/BlankSlate.svelte";
  import EpisodeListItem from "$lib/components/EpisodeListItem.svelte";
  import Paginator from "$lib/components/Paginator/Paginator.svelte";
  import PlaylistButton from "$lib/components/PlaylistButton.svelte";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let episodesOnPlaylist = new SvelteSet<number>();

  $effect(() => {
    episodesOnPlaylist.clear();
    data.episodes.items.filter((e) => e.isOnPlaylist).forEach((e) => episodesOnPlaylist.add(e.id));
  });
</script>

<svelte:head>
  <title>Feed</title>
</svelte:head>

<h1>Feed</h1>
{#if data.episodes.items.length > 0}
  {#each data.episodes.items as { id, title, pubDate, durationSeconds, podcast }}
    <EpisodeListItem {id} {title} {pubDate} {durationSeconds} {podcast}>
      {#snippet buttons()}
        <PlaylistButton
          episodeId={id}
          showAdd={!episodesOnPlaylist.has(id)}
          onAdded={() => {
            episodesOnPlaylist.add(id);
          }}
          onRemoved={() => {
            episodesOnPlaylist.delete(id);
          }}
        />
      {/snippet}
    </EpisodeListItem>
  {/each}
  <Paginator totalItems={data.episodes.totalItems} />
{:else}
  <BlankSlate title="No episodes in your feed"
    >Subscribe to your favorite <a href="/podcasts" class="hyperlink">podcasts</a>
    to see the latest episodes here in one place.</BlankSlate
  >
{/if}
