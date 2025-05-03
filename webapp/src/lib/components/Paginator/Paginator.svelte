<script module lang="ts">
  export function getPaginationInfo(
    searchParams: URLSearchParams,
    totalItems: number,
    itemsPerPage: number
  ):
    | {
        previous: string | undefined;
        next: string | undefined;
        links: {
          page: number;
          href: string;
          isActive: boolean;
        }[];
      }
    | undefined {
    if (totalItems <= itemsPerPage) {
      return undefined;
    }

    let currentPage = Number(searchParams.get("page")) || 1;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) {
      return undefined;
    }

    const PAGINATOR_LENGTH = 5;
    const PAGES_LEFT_RIGHT = 2;
    let start, end;
    if (currentPage - PAGES_LEFT_RIGHT < 1) {
      start = 1;
      end = Math.min(PAGINATOR_LENGTH, totalPages);
    } else if (currentPage + PAGES_LEFT_RIGHT > totalPages) {
      start = Math.max(1, totalPages - PAGINATOR_LENGTH + 1);
      end = totalPages;
    } else {
      start = currentPage - PAGES_LEFT_RIGHT;
      end = currentPage + PAGES_LEFT_RIGHT;
    }

    const makeParams = (n: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", n.toString());
      return `?${newParams.toString()}`;
    };

    let links = [];
    for (let p = start; p <= end; p++) {
      links.push({ href: makeParams(p), page: p, isActive: p === currentPage });
    }

    return {
      previous: currentPage === 1 ? undefined : makeParams(currentPage - 1),
      next: currentPage === totalPages ? undefined : makeParams(currentPage + 1),
      links,
    };
  }
</script>

<script lang="ts">
  import { page } from "$app/state";

  import { PAGE_SIZE } from ".";

  const { totalItems }: { totalItems: number } = $props();

  let paginationInfo = $derived(getPaginationInfo(page.url.searchParams, totalItems, PAGE_SIZE));
</script>

{#if paginationInfo}
  <div class="@container">
    <nav class="mt-6 flex justify-between @min-[550px]:justify-center">
      {#if paginationInfo.previous}
        <a class="btn" href={paginationInfo.previous} aria-label="previous"
          ><i class="fa-solid fa-caret-left"></i></a
        >
      {:else}
        <div class="w-12"></div>
      {/if}

      <div class="hidden @min-[340px]:block @min-[550px]:mx-6">
        {#each paginationInfo.links as { page, href, isActive }}
          <a
            class:font-extrabold={isActive}
            class="inline-block px-2 @min-[460px]:px-2.5 py-1.5"
            {href}>{page}</a
          >
        {/each}
      </div>

      {#if paginationInfo.next}
        <a class="btn" href={paginationInfo.next} aria-label="next"
          ><i class="fa-solid fa-caret-right"></i></a
        >
      {:else}
        <div class="w-12"></div>
      {/if}
    </nav>
  </div>
{/if}

<style>
  @reference "tailwindcss";

  .btn {
    @apply flex w-12 items-center justify-center rounded border border-zinc-400 py-2;
  }
</style>
