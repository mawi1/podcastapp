import type { RequestEvent } from "@sveltejs/kit";
import type { inferAsyncReturnType } from "@trpc/server";

export async function createContext(event: RequestEvent) {
  if (event.locals.user === null) {
    return {
      userId: null,
    };
  } else {
    return {
      userId: event.locals.user.id,
    };
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;
