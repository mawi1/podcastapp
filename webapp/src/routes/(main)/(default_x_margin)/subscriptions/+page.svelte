<script lang="ts">
  import { flip } from "svelte/animate";

  import ActionButton from "$lib/components/ActionButton.svelte";
  import BlankSlate from "$lib/components/BlankSlate.svelte";
  import PodcastListItem from "$lib/components/PodcastListItem.svelte";
  import { trpc } from "$lib/trpc/client";

  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  let podcasts = $state(data.podcasts);
</script>

<svelte:head>
  <title>Subscriptions</title>
</svelte:head>

<h1>Subscriptions</h1>
{#if podcasts.length > 0}
  {#each podcasts as podcast (podcast.id)}
    <div animate:flip>
      <PodcastListItem data={podcast}>
        <ActionButton
          action={async () => {
            await trpc().unsubscribe.mutate({ podcastId: podcast.id });
          }}
          onSuccess={() => {
            podcasts = podcasts.filter((p) => p.id !== podcast.id);
          }}>Unsubscribe</ActionButton
        >
      </PodcastListItem>
    </div>
  {/each}
{:else}
  <BlankSlate title="You have no subscriptions yet"
    >Subscribe to your favorite <a href="/podcasts" class="hyperlink">podcasts</a>
    by clicking on the subscribe button.</BlankSlate
  >
{/if}
