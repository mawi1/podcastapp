<script lang="ts">
  import Button, { ButtonType } from "$lib/components/Button";
  import InputBase from "$lib/components/InputBase.svelte";

  let { initalValue }: { initalValue?: string | null } = $props();
  let value = $state(initalValue || "");
</script>

<div class="mb-10 flex justify-center">
  <form method="GET" action="/podcasts/search" class="relative w-[25rem] max-w-[100%]">
    <InputBase name="q" bind:value class="h-12 w-full pr-14" placeholder="Search Podcasts" autofocus
    ></InputBase>
    <Button
      btnType={ButtonType.Primary}
      type="submit"
      disabled={value === ""}
      class="absolute top-1 right-1 h-10 w-12"><i class="fa-solid fa-magnifying-glass"></i></Button
    >
  </form>
</div>
