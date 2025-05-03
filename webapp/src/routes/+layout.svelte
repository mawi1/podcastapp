<script>
  import "@fortawesome/fontawesome-free/css/all.min.css";

  import "../app.css";

  let { children } = $props();
</script>

<div class="app">
  {@render children()}
</div>
