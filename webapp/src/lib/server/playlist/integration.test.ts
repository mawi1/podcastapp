import { and, count, eq } from "drizzle-orm";
import { describe, expect } from "vitest";

import { type DB, dbTest, insertTestPodcasts, insertTestUser } from "../db-test";
import { playlist } from "../schema";

async function countRows(db: DB, userId: number, episodeId: number): Promise<number> {
  return (
    await db
      .select({ count: count() })
      .from(playlist)
      .where(and(eq(playlist.userId, userId), eq(playlist.episodeId, episodeId)))
  )[0].count;
}

describe("playlist", () => {
  dbTest("add", async ({ db }) => {
    const { addToPlaylist } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await addToPlaylist(1, 138);
    const rows = await countRows(db, 1, 138);
    expect(rows).toBe(1);
  });

  dbTest("add is idempotent", async ({ db }) => {
    const { addToPlaylist } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await addToPlaylist(1, 138);
    await addToPlaylist(1, 138);
    const rows = await countRows(db, 1, 138);
    expect(rows).toBe(1);
  });

  dbTest("remove", async ({ db }) => {
    const { addToPlaylist, removeFromPlaylist } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await addToPlaylist(1, 252);
    const rowsAfterAdd = await countRows(db, 1, 252);
    expect(rowsAfterAdd).toBe(1);

    removeFromPlaylist(1, 252);
    const rowsAfterRemove = await countRows(db, 1, 252);
    expect(rowsAfterRemove).toBe(0);
  });

  dbTest("episodes on playlist", async ({ db }) => {
    const { addToPlaylist, getEpisodesOnPlaylist } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await addToPlaylist(1, 23);
    await addToPlaylist(1, 123);
    await addToPlaylist(1, 86);
    await addToPlaylist(1, 296);

    const e = await getEpisodesOnPlaylist(1);
    expect(e).toMatchSnapshot();
  });
});
