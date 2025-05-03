import { error } from "@sveltejs/kit";

import { Id, PageNo } from "$lib/models";
import { getEpisodesByPodcastId } from "$lib/server/episodes";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const idRes = Id.fromStr(params.id);
  const pageNoRes = PageNo.fromUrl(url);
  if (idRes.isErr() || pageNoRes.isErr()) {
    error(404, "Not Found");
  }

  const { items, totalItems } = await getEpisodesByPodcastId(
    locals.user!.id,
    idRes.value,
    pageNoRes.value
  );
  return {
    episodes: items,
    totalItems,
  };
};
