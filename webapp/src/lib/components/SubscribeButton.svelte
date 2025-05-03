<script lang="ts">
  import { trpc } from "$lib/trpc/client";

  import ActionButton from "./ActionButton.svelte";
  import { ButtonType } from "./Button";

  type Props = {
    podcastId: number;
    isSubscribed: boolean;
    onSubscribed: () => void;
    onUnsubscribed: () => void;
    class?: string;
  };

  let { podcastId, isSubscribed, onSubscribed, onUnsubscribed, class: className }: Props = $props();
</script>

{#if isSubscribed}
  <ActionButton
    class={className}
    action={async () => {
      await trpc().unsubscribe.mutate({ podcastId });
    }}
    onSuccess={onUnsubscribed}>Unsubscribe</ActionButton
  >
{:else}
  <ActionButton
    btnType={ButtonType.Primary}
    class={className}
    action={async () => {
      await trpc().subscribe.mutate({ podcastId });
    }}
    onSuccess={onSubscribed}>Subscribe</ActionButton
  >
{/if}
