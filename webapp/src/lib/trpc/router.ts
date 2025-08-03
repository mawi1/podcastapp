import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";

import { isUsernameAvailable } from "$lib/server/auth";
import { addToPlaylist, removeFromPlaylist } from "$lib/server/playlist";
import { deleteResumeData, setResumeData } from "$lib/server/resume-data";
import { subscribe, unsubscribe } from "$lib/server/subscription";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const router = t.router({
  greeting: t.procedure.query(async () => {
    return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
  }),
  isUsernameAvailable: t.procedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async (opts) => {
      const username = opts.input.username;
      return {
        username,
        isAvailable: await isUsernameAvailable(username),
      };
    }),
  addToPlaylist: protectedProcedure
    .input(
      z.object({
        episodeId: z.number(),
      })
    )
    .mutation(async ({ input: { episodeId }, ctx: { userId } }) => {
      await addToPlaylist(userId, episodeId);
    }),
  removeFromPlaylist: protectedProcedure
    .input(z.object({ episodeId: z.number() }))
    .mutation(async ({ input: { episodeId }, ctx: { userId } }) => {
      await removeFromPlaylist(userId, episodeId);
    }),
  subscribe: protectedProcedure
    .input(z.object({ podcastId: z.number() }))
    .mutation(async ({ input: { podcastId }, ctx: { userId } }) => {
      await subscribe(userId, podcastId);
    }),
  unsubscribe: protectedProcedure
    .input(z.object({ podcastId: z.number() }))
    .mutation(async ({ input: { podcastId }, ctx: { userId } }) => {
      await unsubscribe(userId, podcastId);
    }),
  setResumeData: protectedProcedure
    .input(z.object({ episodeId: z.number(), currentTime: z.number(), playbackRate: z.number() }))
    .mutation(async ({ input: { episodeId, currentTime, playbackRate }, ctx: { userId } }) => {
      await setResumeData(userId, episodeId, { currentTime, playbackRate });
    }),
  deleteResumeData: protectedProcedure
    .input(z.object({ episodeId: z.number() }))
    .mutation(async ({ input: { episodeId }, ctx: { userId } }) => {
      await deleteResumeData(userId, episodeId);
    }),
});

export type Router = typeof router;
