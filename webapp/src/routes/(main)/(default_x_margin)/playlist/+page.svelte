<script lang="ts">
  import { flip } from "svelte/animate";

  import ActionButton from "$lib/components/ActionButton.svelte";
  import BlankSlate from "$lib/components/BlankSlate.svelte";
  import EpisodeListItem from "$lib/components/EpisodeListItem.svelte";
  import { trpc } from "$lib/trpc/client";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  let episodes = $state(data.episodes);
</script>

<svelte:head>
  <title>Playlist</title>
</svelte:head>

<h1>Playlist</h1>
{#if episodes.length > 0}
  {#each episodes as { id, title, pubDate, durationSeconds, podcast } (id)}
    <div animate:flip>
      <EpisodeListItem {id} {title} {pubDate} {durationSeconds} {podcast}>
        {#snippet buttons()}
          <ActionButton
            action={async () => {
              await trpc().removeFromPlaylist.mutate({ episodeId: id });
            }}
            onSuccess={() => {
              episodes = episodes.filter((e) => e.id !== id);
            }}><i class="fa-solid fa-trash"></i> Remove</ActionButton
          >
        {/snippet}
      </EpisodeListItem>
    </div>
  {/each}
{:else}
  <BlankSlate title="Your Playlist is currently empty">
    Add episodes to your playlist to listen to them later.
  </BlankSlate>
{/if}
