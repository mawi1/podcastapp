CREATE TABLE "episode" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "episode_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text,
	"content" text,
	"audio_url" text,
	"pub_date" timestamp with time zone NOT NULL,
	"duration_seconds" integer,
	"guid" text NOT NULL,
	"podcast_id" integer NOT NULL,
	CONSTRAINT "episode__guid__podcast_id__unique" UNIQUE("guid","podcast_id")
);
--> statement-breakpoint
CREATE TABLE "playlist" (
	"user_id" integer NOT NULL,
	"episode_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "playlist_user_id_episode_id_pk" PRIMARY KEY("user_id","episode_id"),
	CONSTRAINT "playlist__user_id__position__unique" UNIQUE("user_id","position")
);
--> statement-breakpoint
CREATE TABLE "podcast" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "podcast_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"link" text NOT NULL,
	"description" text NOT NULL,
	"feed_url" text NOT NULL,
	"updated" boolean DEFAULT true NOT NULL,
	"http_etag" "bytea",
	CONSTRAINT "podcast__feed_url__unique" UNIQUE("feed_url")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"user_id" integer NOT NULL,
	"podcast_id" integer NOT NULL,
	CONSTRAINT "subscription_user_id_podcast_id_pk" PRIMARY KEY("user_id","podcast_id")
);
--> statement-breakpoint
CREATE TABLE "user_" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user__id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "user__username__unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "episode" ADD CONSTRAINT "episode_podcast_id_podcast_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcast"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_user_id_user__id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_episode_id_episode_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user__id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user__id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_podcast_id_podcast_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcast"("id") ON DELETE cascade ON UPDATE no action;