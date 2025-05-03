import { getSubscribedPodcasts } from "$lib/server/subscription";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  return {
    podcasts: await getSubscribedPodcasts(locals.user!.id),
  };
};
