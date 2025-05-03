<script lang="ts">
  type Props = {
    text: string;
  };

  let { text }: Props = $props();
</script>

<div class="my-2 rounded bg-red-400 p-2 text-red-950 border border-red-950">
  <p><i class="fa-solid fa-exclamation mx-2"></i>{text}</p>
</div>
