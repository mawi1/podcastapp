<script lang="ts">
  import { trpc } from "$lib/trpc/client";

  import ActionButton from "./ActionButton.svelte";

  type Props = {
    episodeId: number;
    showAdd: boolean;
    small?: boolean;
    onAdded: () => void;
    onRemoved: () => void;
  };

  let { episodeId, showAdd, small = false, onAdded, onRemoved }: Props = $props();
</script>

{#if showAdd}
  <ActionButton
    action={async () => {
      await trpc().addToPlaylist.mutate({ episodeId });
    }}
    onSuccess={onAdded}
    ><i class="fa-solid fa-plus"></i><span class:hidden={small}>&nbsp;Playlist</span></ActionButton
  >
{:else}
  <ActionButton
    action={async () => {
      await trpc().removeFromPlaylist.mutate({ episodeId });
    }}
    onSuccess={onRemoved}
    ><i class="fa-solid fa-check text-emerald-500"></i><span class:hidden={small}
      >&nbsp;Playlist</span
    ></ActionButton
  >
{/if}
