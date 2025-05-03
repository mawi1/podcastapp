<script lang="ts">
  import { page } from "$app/state";

  import PodcastList from "../../../PodcastList.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Podcasts - {page.params.symbol}</title>
</svelte:head>

<PodcastList podcasts={data.podcasts} />
