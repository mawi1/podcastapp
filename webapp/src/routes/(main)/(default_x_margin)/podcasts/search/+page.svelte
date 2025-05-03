<script lang="ts">
  import { page } from "$app/state";

  import BlankSlate from "$lib/components/BlankSlate.svelte";

  import PodcastList from "../PodcastList.svelte";
  import SearchForm from "../SearchForm.svelte";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  let q = $derived(page.url.searchParams.get("q"));
</script>

<svelte:head>
  <title>Podcasts</title>
</svelte:head>

<SearchForm initalValue={q} />

{#if data.podcasts.length === 0 && q !== ""}
  <BlankSlate>No Podcasts found for <strong>{q}</strong>.</BlankSlate>
{:else}
  <PodcastList podcasts={data.podcasts} />
{/if}
