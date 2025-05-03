<script lang="ts">
  import { page } from "$app/state";

  import { InitialSymbol } from "$lib/models";

  import SearchForm from "../SearchForm.svelte";

  let { children } = $props();
  let symbol = $derived(page.params.symbol);
</script>

<svelte:head>
  <title>Podcasts</title>
</svelte:head>

<SearchForm />

<ul class="mb-1 gap-y-4 flex justify-center flex-wrap">
  {#each Object.values(InitialSymbol) as s}
    <li class="basis-[14.2857142857%] flex items-center justify-center">
      <a
        href="/podcasts/a-z/{s}"
        class={`flex size-12 items-center justify-center rounded-full \
            ${s === symbol ? "bg-emerald-500 text-white" : "hover:text-emerald-500"}`}>{s}</a
      >
    </li>
  {/each}
</ul>

{@render children()}
