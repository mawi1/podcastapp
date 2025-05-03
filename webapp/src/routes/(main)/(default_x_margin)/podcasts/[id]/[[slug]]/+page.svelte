<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  import EpisodeListItem from "$lib/components/EpisodeListItem.svelte";
  import Paginator from "$lib/components/Paginator/Paginator.svelte";
  import PlaylistButton from "$lib/components/PlaylistButton.svelte";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  let episodesOnPlaylist = new SvelteSet<number>();
  let episodes = $derived(data.episodes);
  let totalItems = $derived(data.totalItems);

  $effect(() => {
    episodesOnPlaylist.clear();
    episodes.filter((e) => e.isOnPlaylist).forEach((e) => episodesOnPlaylist.add(e.id));
  });
</script>

<div class="mt-8">
  <h2 class="-mb-1 min-[689px]:mb-0">Episodes</h2>
  <div>
    {#each episodes as { id, title, pubDate, durationSeconds }}
      <EpisodeListItem {id} {title} {pubDate} {durationSeconds}>
        {#snippet buttons()}
          <PlaylistButton
            showAdd={!episodesOnPlaylist.has(id)}
            episodeId={id}
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
  </div>
  <Paginator {totalItems} />
</div>
