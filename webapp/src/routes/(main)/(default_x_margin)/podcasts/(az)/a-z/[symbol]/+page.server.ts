import { error } from "@sveltejs/kit";

import { parseInitialSymbol } from "$lib/models";
import { getPodcastsByInitialSymbol } from "$lib/server/podcasts";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const s = parseInitialSymbol(params.symbol);
  if (s !== undefined) {
    return {
      podcasts: await getPodcastsByInitialSymbol(locals.user!.id, s),
    };
  } else {
    error(404, "Not found");
  }
};
