import { and, asc, eq, max } from "drizzle-orm";

import type { EpisodeBaseData, PodcastRef } from "$lib/models";

import db from "../db";
import { episode, playlist, podcast } from "../schema";

export async function addToPlaylist(userId: number, episodeId: number): Promise<void> {
  return db.transaction(
    async (tx) => {
      const maxPosition = await tx
        .select({ value: max(playlist.position) })
        .from(playlist)
        .where(eq(playlist.userId, userId));
      const position = maxPosition[0].value === null ? -2147483648 : maxPosition[0].value + 1;
      await tx.insert(playlist).values({ userId, episodeId, position }).onConflictDoNothing();
    },
    {
      isolationLevel: "serializable",
    }
  );
}

export async function removeFromPlaylist(userId: number, episodeId: number): Promise<void> {
  return db.transaction(
    async (tx) => {
      await tx
        .delete(playlist)
        .where(and(eq(playlist.userId, userId), eq(playlist.episodeId, episodeId)));
    },
    {
      isolationLevel: "serializable",
    }
  );
}

export type PlaylistEpisodeListItemData = EpisodeBaseData & {
  podcast: PodcastRef;
};

export async function getEpisodesOnPlaylist(
  userId: number
): Promise<PlaylistEpisodeListItemData[]> {
  return (
    await db
      .select({
        id: episode.id,
        title: episode.title,
        pubDate: episode.pubDate,
        durationSeconds: episode.durationSeconds,
        podcastId: podcast.id,
        podcastTitle: podcast.title,
      })
      .from(playlist)
      .innerJoin(episode, eq(playlist.episodeId, episode.id))
      .innerJoin(podcast, eq(episode.podcastId, podcast.id))
      .where(eq(playlist.userId, userId))
      .orderBy(asc(playlist.position))
  ).map((e) => {
    return {
      id: e.id,
      title: e.title,
      pubDate: e.pubDate,
      durationSeconds: e.durationSeconds,
      podcast: {
        id: e.podcastId,
        title: e.podcastTitle,
      },
    };
  });
}
