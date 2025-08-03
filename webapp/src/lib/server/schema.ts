import {
  boolean,
  customType,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const user = pgTable("user_", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique("user__username__unique").notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});

export const podcast = pgTable("podcast", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  link: text("link").notNull(),
  description: text("description").notNull(),
  feedUrl: text("feed_url").notNull().unique("podcast__feed_url__unique"),
  updated: boolean("updated").notNull().default(true),
  httpEtag: bytea("http_etag"),
});

export const episode = pgTable(
  "episode",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: text("title"),
    content: text("content"),
    audioUrl: text("audio_url"),
    pubDate: timestamp("pub_date", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    durationSeconds: integer("duration_seconds"),
    guid: text("guid").notNull(),
    podcastId: integer("podcast_id")
      .notNull()
      .references(() => podcast.id, { onDelete: "cascade" }),
  },
  (t) => [unique("episode__guid__podcast_id__unique").on(t.guid, t.podcastId)]
);

export const subscription = pgTable(
  "subscription",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    podcastId: integer("podcast_id")
      .notNull()
      .references(() => podcast.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.podcastId] })]
);

export const playlist = pgTable(
  "playlist",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    episodeId: integer("episode_id")
      .notNull()
      .references(() => episode.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.episodeId] }),
    unique("playlist__user_id__position__unique").on(t.userId, t.position),
  ]
);

export const resumeData = pgTable(
  "resume_data",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    episodeId: integer("episode_id")
      .notNull()
      .references(() => episode.id, { onDelete: "cascade" }),
    currentTime: doublePrecision("current_time").notNull(),
    playbackRate: doublePrecision("playback_rate").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.episodeId] })]
);
