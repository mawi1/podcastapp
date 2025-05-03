<script>
  import { enhance } from "$app/forms";
  import { page } from "$app/state";

  let { children } = $props();

  let showNav = $state(false);
</script>

{#snippet links()}
  <li>
    <a
      onclick={() => {
        showNav = false;
      }}
      href="/"
      class:active={page.route.id === "/(main)/(default_x_margin)"}>Feed</a
    >
  </li>
  <li>
    <a
      onclick={() => {
        showNav = false;
      }}
      href="/playlist"
      class:active={page.route.id === "/(main)/(default_x_margin)/playlist"}>Playlist</a
    >
  </li>
  <li>
    <a
      onclick={() => {
        showNav = false;
      }}
      href="/subscriptions"
      class:active={page.route.id === "/(main)/(default_x_margin)/subscriptions"}>Subscriptions</a
    >
  </li>
  <li>
    <a
      onclick={() => {
        showNav = false;
      }}
      href="/podcasts"
      class:active={page.route.id?.startsWith("/(main)/(default_x_margin)/podcasts")}>Podcasts</a
    >
  </li>
{/snippet}

<!-- desktop nav -->
<div class="nav desktop h-screen w-64 items-start justify-center hidden min-[1072px]:flex text-lg">
  <nav class="mt-[15vh] flex items-center justify-center">
    <ul>
      {@render links()}
      <li>
        <form method="post" action="/logout" use:enhance class="mt-12">
          <button type="submit" class="cursor-pointer">Logout</button>
        </form>
      </li>
    </ul>
  </nav>
</div>

<!-- sm nav -->
<div
  class="nav w-screen h-12 text-sm min-[480px]:text-base hidden min-[375px]:max-[1072px]:flex z-1000"
>
  <div class="flex-1"></div>
  <nav class="flex-6">
    <ul class="flex items-center justify-between h-full">
      {@render links()}
    </ul>
  </nav>
  <form method="post" action="/logout" use:enhance class="flex-1 flex items-center justify-center">
    <button type="submit" aria-label="logout"><i class="fa-solid fa-right-from-bracket"></i></button
    >
  </form>
</div>

<!-- xs nav -->
<div class="nav xs flex flex-col w-screen text-sm min-[375px]:hidden z-1000">
  <button
    aria-label="menu"
    class="p-1.5"
    onpointerdown={() => {
      showNav = !showNav;
    }}><i class="fa-solid fa-bars"></i></button
  >
  <nav class="mb-2" class:hidden={!showNav}>
    <ul class="w-full flex flex-col items-center">
      {@render links()}
      <li>
        <form method="post" action="/logout" use:enhance>
          <button type="submit" aria-label="logout"
            ><i class="fa-solid fa-right-from-bracket"></i></button
          >
        </form>
      </li>
    </ul>
  </nav>
</div>

<main class="w-full mt-11 min-[375px]:mt-16 min-[1072px]:mt-9 mb-10">
  <div class="max-w-2xl mx-auto min-[1072px]:ml-82">
    {@render children()}
  </div>
</main>

<style>
  @reference "tailwindcss";

  .nav {
    @apply fixed top-0 left-0 bg-zinc-800 text-white;
  }

  .desktop a {
    @apply mt-6 inline-block;
  }

  .xs a {
    @apply mb-1.5 inline-block;
  }

  .nav a {
    @apply border-b-2 border-transparent;
  }

  .nav .active {
    @apply border-b-2 border-emerald-500;
  }
</style>
