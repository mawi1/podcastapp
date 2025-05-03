<script lang="ts">
  import type { Snippet } from "svelte";

  import { formatDate, formatTime } from "$lib/datetime";
  import type { PodcastRef } from "$lib/models";
  import { episodePath, podcastPath } from "$lib/paths";

  import Button, { ButtonSize, ButtonType } from "./Button";
  import ListItem from "./ListItem.svelte";

  type Props = {
    buttons: Snippet;
    id: number;
    title: string | null;
    pubDate: Date;
    durationSeconds: number | null;
    podcast?: PodcastRef;
  };

  const { buttons, id, title, pubDate, durationSeconds, podcast }: Props = $props();

  let path = $derived(episodePath(id, title));
</script>

<ListItem>
  {#if podcast}
    <div class="text-sm mb-1">
      <a class="hyperlink" href={podcastPath(podcast.id, podcast.title)}>{podcast.title}</a>
    </div>
  {/if}
  <h3><a href={path}>{title || "Untitled Episode"}</a></h3>
  <div class="text-sm my-2 leading-none">
    <time datetime={pubDate.toISOString()}>{formatDate(pubDate)}</time>{#if durationSeconds}<span
        class="mx-2">•</span
      >{formatTime(durationSeconds, true)}{/if}
  </div>
  <div class="flex items-start">
    <Button href="{path}?play" class="mr-2" size={ButtonSize.S} btnType={ButtonType.Primary}
      ><i class="fa-solid fa-play"></i> Play</Button
    >
    {@render buttons()}
  </div>
</ListItem>
