import { getEpisodesOnPlaylist } from "$lib/server/playlist";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  return {
    episodes: await getEpisodesOnPlaylist(locals.user!.id),
  };
};
