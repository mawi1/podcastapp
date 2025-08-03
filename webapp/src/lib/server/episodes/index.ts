import { and, count, desc, eq, sql } from "drizzle-orm";

import { PAGE_SIZE } from "$lib/components/Paginator";
import type { EpisodeBaseData, Id, PageNo, PaginatedList, PodcastRef, ResumeData } from "$lib/models";

import db from "../db";
import { episode, podcast, resumeData as resumeDataTable } from "../schema";
import { userPlaylistSubquery } from "../subqueries";

export type EpisodeListItemData = EpisodeBaseData & {
  isOnPlaylist: boolean;
};

export async function getEpisodesByPodcastId(
  userId: number,
  podcastId: Id,
  pageNo: PageNo
): Promise<PaginatedList<EpisodeListItemData>> {
  const episodesCount = (
    await db.select({ count: count() }).from(episode).where(eq(episode.podcastId, podcastId.id))
  )[0].count;
  const subQuery = userPlaylistSubquery(userId);
  const episodes = await db
    .select({
      id: episode.id,
      title: episode.title,
      pubDate: episode.pubDate,
      durationSeconds: episode.durationSeconds,
      isOnPlaylist: sql<boolean>`${subQuery.episodeId} is NOT NULL`,
    })
    .from(episode)
    .leftJoin(subQuery, eq(episode.id, subQuery.episodeId))
    .where(eq(episode.podcastId, podcastId.id))
    .orderBy(desc(episode.pubDate), desc(episode.id))
    .limit(PAGE_SIZE)
    .offset((pageNo.pageNo - 1) * PAGE_SIZE);
  return {
    totalItems: episodesCount,
    items: episodes,
  };
}

export type EpisodeDetails = EpisodeBaseData & {
  content: string | null;
  audioUrl: string | null;
  isOnPlaylist: boolean;
  podcast: PodcastRef;
  resumeData: ResumeData | null ;
};

export async function getEpisodeById(userId: number, id: Id): Promise<EpisodeDetails | undefined> {
  const subQuery = userPlaylistSubquery(userId);
  const episodeDb = await db
    .select({
      id: episode.id,
      title: episode.title,
      pubDate: episode.pubDate,
      durationSeconds: episode.durationSeconds,
      content: episode.content,
      audioUrl: episode.audioUrl,
      isOnPlaylist: sql<boolean>`${subQuery.episodeId} is NOT NULL`,
      podcastId: podcast.id,
      podcastTitle: podcast.title,
      currentTime: resumeDataTable.currentTime,
      playbackRate: resumeDataTable.playbackRate,
    })
    .from(episode)
    .innerJoin(podcast, eq(episode.podcastId, podcast.id))
    .leftJoin(subQuery, eq(episode.id, subQuery.episodeId))
    .leftJoin(resumeDataTable, and(eq(resumeDataTable.episodeId, episode.id), eq(resumeDataTable.userId, userId)))
    .where(eq(episode.id, id.id));
  if (episodeDb.length === 0) {
    return undefined;
  } else {
    let resumeData;
    if (episodeDb[0].currentTime !== null && episodeDb[0].playbackRate !== null) {
      resumeData = {
        currentTime: episodeDb[0].currentTime,
        playbackRate: episodeDb[0].playbackRate,
      };
    } else {
      resumeData = null;
    }
    return {
      id: episodeDb[0].id,
      title: episodeDb[0].title,
      pubDate: episodeDb[0].pubDate,
      durationSeconds: episodeDb[0].durationSeconds,
      content: episodeDb[0].content,
      audioUrl: episodeDb[0].audioUrl,
      isOnPlaylist: episodeDb[0].isOnPlaylist,
      podcast: {
        id: episodeDb[0].podcastId,
        title: episodeDb[0].podcastTitle,
      },
      resumeData,
    };
  }
}
