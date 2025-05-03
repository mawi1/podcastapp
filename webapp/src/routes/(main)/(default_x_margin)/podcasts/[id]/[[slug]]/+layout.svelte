<script lang="ts">
  import { type Snippet, onMount } from "svelte";

  import SubscribeButton from "$lib/components/SubscribeButton.svelte";

  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let isClamped = $state(false);
  let isSubscribed = $state(data.podcast.isSubscribed);
  let readMore = $state(true);

  onMount(() => {
    isClamped = p.scrollHeight > p.clientHeight;
  });

  let p: HTMLParagraphElement;

  function formatUrl(url: string): string {
    return url.replace(/^\w+:\/\//, "");
  }
</script>

<svelte:head>
  <title>{data.podcast.title}</title>
</svelte:head>

<div>
  <h1>{data.podcast.title}</h1>
  <div class="text-sm mt-1">
    <i class="fa-solid fa-link">&nbsp;</i><a
      class="hyperlink"
      rel="noopener noreferrer"
      target="_blank"
      href={data.podcast.link}>{formatUrl(data.podcast.link)}</a
    >
  </div>
  <div class="my-3">
    <SubscribeButton
      podcastId={data.podcast.id}
      {isSubscribed}
      onSubscribed={() => {
        isSubscribed = true;
      }}
      onUnsubscribed={() => {
        isSubscribed = false;
      }}
    />
  </div>
  <p class:line-clamp-2={readMore} bind:this={p}>{data.podcast.description}</p>
  {#if isClamped}
    {#if readMore}
      <button onclick={() => (readMore = false)}
        >Read more&nbsp;<i class="fa-solid fa-caret-down"></i></button
      >
    {:else}
      <button onclick={() => (readMore = true)}
        >Read less&nbsp;<i class="fa-solid fa-caret-up"></i></button
      >
    {/if}
  {/if}
</div>

{@render children()}
