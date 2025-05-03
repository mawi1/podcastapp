import { redirect } from "@sveltejs/kit";

import { logoutUser } from "$lib/server/auth";

import type { Actions } from "./$types";

export const actions = {
  default: async (event) => {
    const cookie = await logoutUser(event.locals.session!.id);
    event.cookies.set(cookie.name, cookie.value, {
      path: ".",
      ...cookie.attributes,
    });
    redirect(302, "/login");
  },
} satisfies Actions;
