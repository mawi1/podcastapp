<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  import PodcastListItem from "$lib/components/PodcastListItem.svelte";
  import SubscribeButton from "$lib/components/SubscribeButton.svelte";
  import type { PodCastListItemData } from "$lib/server/podcasts";

  const { podcasts }: { podcasts: PodCastListItemData[] } = $props();

  let subscribedPodcasts = new SvelteSet<number>();

  $effect(() => {
    subscribedPodcasts.clear();
    podcasts.filter((p) => p.isSubscribed).forEach((e) => subscribedPodcasts.add(e.id));
  });
</script>

{#each podcasts as p}
  <PodcastListItem data={p}>
    <SubscribeButton
      podcastId={p.id}
      isSubscribed={subscribedPodcasts.has(p.id)}
      onSubscribed={() => {
        subscribedPodcasts.add(p.id);
      }}
      onUnsubscribed={() => {
        subscribedPodcasts.delete(p.id);
      }}
    />
  </PodcastListItem>
{/each}
