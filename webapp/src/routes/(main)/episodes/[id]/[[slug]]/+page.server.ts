import { error } from "@sveltejs/kit";

import { Id } from "$lib/models";
import { getEpisodeById } from "$lib/server/episodes";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const idRes = Id.fromStr(params.id);
  if (idRes.isErr()) {
    error(404, "Not Found");
  }
  const episodeDetails = await getEpisodeById(locals.user!.id, idRes.value);
  if (episodeDetails === undefined) {
    error(404, "Not Found");
  }

  return {
    episodeDetails,
  };
};
