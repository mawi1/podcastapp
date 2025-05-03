import { fail, redirect } from "@sveltejs/kit";

import { Credentials, loginUser } from "$lib/server/auth";

import type { Actions } from "./$types";

export const actions = {
  default: async (event) => {
    const data = await event.request.formData();
    const credRes = Credentials.fromFormData(data);
    if (credRes.isErr()) {
      return fail(400, {
        error: credRes.error,
      });
    }

    const loginRes = await loginUser(credRes.value);
    if (loginRes.isOk()) {
      const cookie = loginRes.value;
      event.cookies.set(cookie.name, cookie.value, {
        path: "/",
        ...cookie.attributes,
      });
      redirect(303, "/");
    } else {
      return fail(400, {
        error: loginRes.error,
      });
    }
  },
} satisfies Actions;
