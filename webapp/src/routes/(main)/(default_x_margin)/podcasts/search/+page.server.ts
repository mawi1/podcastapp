import { searchPodcasts } from "$lib/server/podcasts";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const q = url.searchParams.get("q");

  if (q === null) {
    return {
      podcasts: [],
    };
  } else {
    return {
      podcasts: await searchPodcasts(locals.user!.id, q),
    };
  }
};
