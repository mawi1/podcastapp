import { fail, redirect } from "@sveltejs/kit";

import { NewUser, registerUser } from "$lib/server/auth";

import type { Actions } from "./$types";

export const actions = {
  default: async (event) => {
    const data = await event.request.formData();
    const userRes = NewUser.fromFormData(data);
    if (userRes.isErr()) {
      return fail(400, {
        error: userRes.error,
      });
    }

    const registerRes = await registerUser(userRes.value);
    if (registerRes.isErr()) {
      return fail(400, {
        error: registerRes.error,
      });
    }
    const cookie = registerRes.value;
    event.cookies.set(cookie.name, cookie.value, {
      path: ".",
      ...cookie.attributes,
    });
    redirect(303, "/");
  },
} satisfies Actions;
