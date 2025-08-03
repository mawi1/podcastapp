<script lang="ts">
  import { page } from "$app/state";

  import Button, { ButtonSize } from "$lib/components/Button";
  import PageXMargin from "$lib/components/PageXMargin.svelte";
  import PlaylistButton from "$lib/components/PlaylistButton.svelte";
  import { formatDate, formatTime } from "$lib/datetime";
  import { podcastPath } from "$lib/paths";

  import type { PageData } from "./$types";
  import Player from "./Player";

  const { data }: { data: PageData } = $props();

  let autoplay = page.url.searchParams.get("play") !== null;

  let episodeDetails = $derived(data.episodeDetails);
  let isOnPlaylist = $state(data.episodeDetails.isOnPlaylist);
  let width = $state(0);
  let buttonsSmall = $derived(width < 600);
</script>

<svelte:head>
  <title>{data.episodeDetails.title}</title>
</svelte:head>

<div bind:clientWidth={width}>
  <PageXMargin>
    <div class="text-sm mb-2">
      <a
        class="hyperlink"
        href={podcastPath(episodeDetails.podcast.id, episodeDetails.podcast.title)}
        >{episodeDetails.podcast.title}</a
      >
    </div>
    <h1>{episodeDetails.title}</h1>
    <div class="my-3 text-sm leading-none">
      <time datetime={episodeDetails.pubDate.toISOString()}>
        {formatDate(episodeDetails.pubDate)}
      </time>{#if episodeDetails.durationSeconds}<span class="mx-2">•</span>{formatTime(
          episodeDetails.durationSeconds,
          true
        )}{/if}
    </div>
  </PageXMargin>

  {#if episodeDetails.audioUrl}
    <Player episodeId={episodeDetails.id} audioUrl={episodeDetails.audioUrl} {autoplay} resumeData={episodeDetails.resumeData} />
    <PageXMargin>
      <div class="my-3 flex justify-end">
        <PlaylistButton
          episodeId={episodeDetails.id}
          showAdd={!isOnPlaylist}
          small={buttonsSmall}
          onAdded={() => {
            isOnPlaylist = true;
          }}
          onRemoved={() => {
            isOnPlaylist = false;
          }}
        />
        <Button href={episodeDetails.audioUrl} download size={ButtonSize.S} class="ml-2"
          ><i class="fa-solid fa-download"></i><span class:hidden={buttonsSmall}
            >&nbsp;Download</span
          ></Button
        >
      </div>
    </PageXMargin>
  {/if}

  <PageXMargin>
    <div id="content">
      <!-- eslint-disable -->
      {@html episodeDetails.content}
    </div>
  </PageXMargin>
</div>

<style>
  #content :global(p) {
    margin-top: 0.8rem;
  }

  #content {
    overflow-wrap: break-word;
  }
</style>
