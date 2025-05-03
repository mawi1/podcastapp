<script>
  let { children } = $props();
</script>

<svelte:head>
  <style>
    html,
    body,
    .app {
      height: 100%;
    }
    .app {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    main {
      display: contents;
    }
  </style>
</svelte:head>

<main>
  {@render children()}
</main>
