import { eq, max } from "drizzle-orm";

import db from "./db";
import { episode, playlist, subscription } from "./schema";

export const latestEpisodeSubquery = db
  .select({ podcastId: episode.podcastId, latestEpisode: max(episode.pubDate).as("latestEpisode") })
  .from(episode)
  .groupBy(episode.podcastId)
  .as("latest_episode");

export function userPlaylistSubquery(userId: number) {
  return db
    .select({ episodeId: playlist.episodeId })
    .from(playlist)
    .where(eq(playlist.userId, userId))
    .as("user_playlist");
}

export function userSubscriptionsSubquery(userId: number) {
  return db
    .select({ podcastId: subscription.podcastId })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .as("user_subscriptions");
}
