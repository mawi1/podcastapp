import { count, desc, eq, sql } from "drizzle-orm";

import { PAGE_SIZE } from "$lib/components/Paginator";
import type { EpisodeBaseData, PageNo, PaginatedList, PodcastRef } from "$lib/models";

import db from "../db";
import { episode, podcast, subscription } from "../schema";
import { userPlaylistSubquery } from "../subqueries";

export type FeedEpisodeListItemData = EpisodeBaseData & {
  isOnPlaylist: boolean;
  podcast: PodcastRef;
};

export async function getFeed(
  userId: number,
  pageNo: PageNo
): Promise<PaginatedList<FeedEpisodeListItemData>> {
  const subquery = userPlaylistSubquery(userId);
  const episodes = (
    await db
      .select({
        id: episode.id,
        title: episode.title,
        pubDate: episode.pubDate,
        durationSeconds: episode.durationSeconds,
        isOnPlaylist: sql<boolean>`${subquery.episodeId} is NOT NULL`,
        podcastId: podcast.id,
        podcastTitle: podcast.title,
      })
      .from(subscription)
      .innerJoin(podcast, eq(subscription.podcastId, podcast.id))
      .innerJoin(episode, eq(podcast.id, episode.podcastId))
      .leftJoin(subquery, eq(episode.id, subquery.episodeId))
      .where(eq(subscription.userId, userId))
      .orderBy(desc(episode.pubDate))
      .limit(PAGE_SIZE)
      .offset((pageNo.pageNo - 1) * PAGE_SIZE)
  ).map((e) => {
    return {
      id: e.id,
      title: e.title,
      pubDate: e.pubDate,
      durationSeconds: e.durationSeconds,
      isOnPlaylist: e.isOnPlaylist,
      podcast: {
        id: e.podcastId,
        title: e.podcastTitle,
      },
    };
  });
  const episodesCount = (
    await db
      .select({ count: count() })
      .from(subscription)
      .innerJoin(podcast, eq(subscription.podcastId, podcast.id))
      .innerJoin(episode, eq(podcast.id, episode.podcastId))
      .where(eq(subscription.userId, userId))
  )[0].count;
  return {
    items: episodes,
    totalItems: episodesCount,
  };
}
