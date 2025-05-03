import { error } from "@sveltejs/kit";

import { Id } from "$lib/models";
import { getPodcastById } from "$lib/server/podcasts";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params, locals }) => {
  const idRes = Id.fromStr(params.id);
  if (idRes.isErr()) {
    error(404, "Not Found");
  }
  const podcast = await getPodcastById(locals.user!.id, idRes.value);
  if (podcast === undefined) {
    error(404, "Not Found");
  }

  return {
    podcast: podcast!,
  };
};
