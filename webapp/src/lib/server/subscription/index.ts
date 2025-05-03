import { and, eq } from "drizzle-orm";

import type { PodcastBaseData } from "$lib/models";

import db from "../db";
import { podcast, subscription } from "../schema";
import { latestEpisodeSubquery } from "../subqueries";

export async function subscribe(userId: number, podcastId: number): Promise<void> {
  await db
    .insert(subscription)
    .values({ userId, podcastId })
    .onConflictDoNothing({ target: [subscription.userId, subscription.podcastId] });
}

export async function unsubscribe(userId: number, podcastId: number): Promise<void> {
  await db
    .delete(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.podcastId, podcastId)));
}

export async function getSubscribedPodcasts(userId: number): Promise<PodcastBaseData[]> {
  return db
    .select({
      id: podcast.id,
      title: podcast.title,
      latestEpisode: latestEpisodeSubquery.latestEpisode,
    })
    .from(subscription)
    .innerJoin(podcast, eq(subscription.podcastId, podcast.id))
    .leftJoin(latestEpisodeSubquery, eq(podcast.id, latestEpisodeSubquery.podcastId))
    .where(eq(subscription.userId, userId))
    .orderBy(podcast.title);
}
