import { error } from "@sveltejs/kit";

import { PageNo } from "$lib/models";
import { getFeed } from "$lib/server/feed";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const pageNoRes = PageNo.fromUrl(url);
  if (pageNoRes.isErr()) {
    error(404, "Not Found");
  }
  return {
    episodes: await getFeed(locals.user!.id, pageNoRes.value),
  };
};
