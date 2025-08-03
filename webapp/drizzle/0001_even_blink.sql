CREATE TABLE "resume_data" (
	"user_id" integer NOT NULL,
	"episode_id" integer NOT NULL,
	"current_time" double precision NOT NULL,
	"playback_rate" double precision NOT NULL,
	CONSTRAINT "resume_data_user_id_episode_id_pk" PRIMARY KEY("user_id","episode_id")
);
--> statement-breakpoint
ALTER TABLE "resume_data" ADD CONSTRAINT "resume_data_user_id_user__id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_data" ADD CONSTRAINT "resume_data_episode_id_episode_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episode"("id") ON DELETE cascade ON UPDATE no action;