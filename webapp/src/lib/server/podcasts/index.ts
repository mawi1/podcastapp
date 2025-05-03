import { eq, ilike, sql } from "drizzle-orm";

import { type Id, InitialSymbol, type PodcastBaseData } from "$lib/models";

import db from "../db";
import { podcast } from "../schema";
import { latestEpisodeSubquery, userSubscriptionsSubquery } from "../subqueries";

export type PodcastDetailsData = {
  id: number;
  title: string;
  link: string;
  description: string;
  isSubscribed: boolean;
};

export async function getPodcastById(
  userId: number,
  podcastId: Id
): Promise<PodcastDetailsData | undefined> {
  const subQuery = userSubscriptionsSubquery(userId);
  const podcastDb = await db
    .select({
      id: podcast.id,
      title: podcast.title,
      link: podcast.link,
      description: podcast.description,
      isSubscribed: sql<boolean>`${subQuery.podcastId} is NOT NULL`,
    })
    .from(podcast)
    .leftJoin(subQuery, eq(podcast.id, subQuery.podcastId))
    .where(eq(podcast.id, podcastId.id));
  if (podcastDb.length === 0) {
    return undefined;
  } else {
    return podcastDb[0];
  }
}

export type PodCastListItemData = PodcastBaseData & {
  isSubscribed: boolean;
};

export async function getPodcastsByInitialSymbol(
  userId: number,
  s: InitialSymbol
): Promise<PodCastListItemData[]> {
  const subQuery = userSubscriptionsSubquery(userId);
  const query = db
    .select({
      id: podcast.id,
      title: podcast.title,
      latestEpisode: latestEpisodeSubquery.latestEpisode,
      isSubscribed: sql<boolean>`${subQuery.podcastId} is NOT NULL`,
    })
    .from(podcast)
    .leftJoin(latestEpisodeSubquery, eq(podcast.id, latestEpisodeSubquery.podcastId))
    .leftJoin(subQuery, eq(podcast.id, subQuery.podcastId))
    .orderBy(podcast.title);
  switch (s) {
    case InitialSymbol.A:
    case InitialSymbol.B:
    case InitialSymbol.C:
    case InitialSymbol.D:
    case InitialSymbol.E:
    case InitialSymbol.F:
    case InitialSymbol.G:
    case InitialSymbol.H:
    case InitialSymbol.I:
    case InitialSymbol.J:
    case InitialSymbol.K:
    case InitialSymbol.L:
    case InitialSymbol.M:
    case InitialSymbol.N:
    case InitialSymbol.O:
    case InitialSymbol.P:
    case InitialSymbol.Q:
    case InitialSymbol.R:
    case InitialSymbol.S:
    case InitialSymbol.T:
    case InitialSymbol.U:
    case InitialSymbol.V:
    case InitialSymbol.W:
    case InitialSymbol.X:
    case InitialSymbol.Y:
    case InitialSymbol.Z:
      return query.where(ilike(podcast.title, `${s}%`));
    case InitialSymbol.Numeric:
      return query.where(sql`${podcast.title} ~ '^[0-9].*$'`);
    case InitialSymbol.Other:
      return query.where(sql`${podcast.title} ~ '^[^A-Za-z0-9].*$'`);
    default:
      ((x: never) => {
        throw new Error(`${x} was unhandled!`);
      })(s);
  }
}

export async function searchPodcasts(userId: number, q: string): Promise<PodCastListItemData[]> {
  if (q === "") {
    return [];
  } else {
    const subQuery = userSubscriptionsSubquery(userId);
    return db
      .select({
        id: podcast.id,
        title: podcast.title,
        latestEpisode: latestEpisodeSubquery.latestEpisode,
        isSubscribed: sql<boolean>`${subQuery.podcastId} is NOT NULL`,
      })
      .from(podcast)
      .leftJoin(latestEpisodeSubquery, eq(podcast.id, latestEpisodeSubquery.podcastId))
      .leftJoin(subQuery, eq(podcast.id, subQuery.podcastId))
      .orderBy(podcast.title)
      .where(ilike(podcast.title, `%${q}%`));
  }
}
