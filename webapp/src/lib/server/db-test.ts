import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path, { dirname } from "path";
import { Client, Pool } from "pg";
import sha1 from "simple-sha1";
import { fileURLToPath } from "url";
import { expect, inject, test, vi } from "vitest";

import * as schema from "./schema";
import { episode, podcast } from "./schema";

export type DB = NodePgDatabase<typeof import("./schema")> & { $client: Pool };

export async function insertTestUser(db: DB): Promise<void> {
  const passwordHash =
    "$argon2id$v=19$m=19456,t=2,p=1$C4ma4F2Ing8dghbBKekbmw$L6K7xP4lGY2jI79nheDwCK1QXYiKShcJtOJ4t4xdRBg"; // password111
  await db.insert(schema.user).values({ username: "testuser", passwordHash });
}

export async function insertTestPodcasts(db: DB) {
  const insert = async (title: string): Promise<number> => {
    const link = `http://${title.replaceAll(" ", "").toLocaleLowerCase()}.com`;
    const feedUrl = link + "/feed.xml";
    const description = `Podcast ${title} description`;
    const podcastId = (
      await db
        .insert(podcast)
        .values({ title: title, link, description, feedUrl })
        .returning({ id: podcast.id })
    )[0].id;
    return podcastId;
  };

  const podcasts = [
    {
      title: "The Startup Squad",
      episodes: 34,
      // id 1
    },
    {
      title: "Love in the Algorithm",
      episodes: 101,
      // id 2
    },
    {
      title: "Murder at the Microphone",
      episodes: 45,
      // id 3
    },
    {
      title: "The Paranormal Pundits",
      episodes: 29,
      // id 4
    },
    {
      title: "Tech Tales from the Future",
      episodes: 255,
      // id 5
    },
    {
      title: "Fitness Frontier",
      episodes: 12,
      // id 6
    },
    {
      title: "Culinary Crime Scene",
      episodes: 22,
      // id 7
    },
    {
      title: "The Historical Haunts",
      episodes: 612,
      // id 8
    },
    {
      title: "8-Bit Adventures",
      episodes: 93,
      // id 9
    },
    {
      title: "12 Steps to Success",
      episodes: 278,
      // id 10
    },
    {
      title: "@Tech Talk ",
      episodes: 145,
      // id 11
    },
    {
      title: "+Positive Vibes",
      episodes: 102,
      // id 12
    },
  ];
  const startDate = new Date(Date.UTC(2024, 1, 1, 0, 0, 0, 0)).getTime();
  for (const p of podcasts) {
    const podcastId = await insert(p.title);
    for (let i = 1; i <= p.episodes; i++) {
      const title = `Podcast (${podcastId}) Episode #${i}`;
      const content = "<p>Content ${title}</p>";
      const audioUrl = `http://podcastapp.mawi.cc/podcast/${podcastId}/${i}/audio.mp3`;
      const guid = `${podcastId}_${i}`;
      const durationSeconds = 234 + 3 * i;
      const pubDate = new Date(startDate + podcastId * 8 + i * 3600000 * 17);
      await db
        .insert(episode)
        .values({ podcastId, title, content, audioUrl, guid, durationSeconds, pubDate });
    }
  }
}

interface Fixture {
  db: DB;
}

type PostgresConfig = {
  user: string;
  password: string;
  host: string;
  port: number;
};

async function run_sql(config: PostgresConfig, sql: string) {
  const client = new Client(config);
  await client.connect();
  client.on("error", (err) => {
    console.error("something bad has happened!", err.stack);
  });
  await client.query(sql);
  await client.end();
}

declare module "vitest" {
  export interface ProvidedContext {
    postgresConfig: {
      user: string;
      password: string;
      host: string;
      port: number;
    };
  }
}

export const dbTest = test.extend<Fixture>({
  // eslint-disable-next-line no-empty-pattern
  db: async ({}, use) => {
    vi.resetModules();

    const config = inject("postgresConfig");

    if (expect.getState().currentTestName === undefined) {
      throw "no test name provided";
    }
    const dbName = "D" + sha1.sync(expect.getState().currentTestName!);
    await run_sql(config, `CREATE DATABASE "${dbName}";`);

    const migrationsFolder = path.resolve(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "..",
      "drizzle"
    );
    const pool = new Pool({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      database: dbName,
    });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder });

    vi.doMock("./db.ts", () => {
      return {
        default: db,
      };
    });
    await use(db);
    await pool.end();
    await run_sql(config, `DROP DATABASE "${dbName}";`);
  },
});
