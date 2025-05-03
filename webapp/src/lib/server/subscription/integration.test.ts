import { and, count, eq } from "drizzle-orm";
import { describe, expect } from "vitest";

import { type DB, dbTest, insertTestPodcasts, insertTestUser } from "../db-test";
import { subscription } from "../schema";

async function countRows(db: DB, userId: number, podcastId: number): Promise<number> {
  return (
    await db
      .select({ count: count() })
      .from(subscription)
      .where(and(eq(subscription.userId, userId), eq(subscription.podcastId, podcastId)))
  )[0].count;
}

describe("playlist", () => {
  dbTest("subscribe", async ({ db }) => {
    const { subscribe } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await subscribe(1, 7);
    const rows = await countRows(db, 1, 7);
    expect(rows).toBe(1);
  });

  dbTest("subscribe is idempotent", async ({ db }) => {
    const { subscribe } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await subscribe(1, 7);
    await subscribe(1, 7);
    const rows = await countRows(db, 1, 7);
    expect(rows).toBe(1);
  });

  dbTest("unsubscribe", async ({ db }) => {
    const { subscribe, unsubscribe } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await subscribe(1, 9);
    const rowsAfterSubscribe = await countRows(db, 1, 9);
    expect(rowsAfterSubscribe).toBe(1);

    await unsubscribe(1, 9);
    const rowsAfterUnsubscribe = await countRows(db, 1, 9);
    expect(rowsAfterUnsubscribe).toBe(0);
  });

  dbTest("subscribed podcasts", async ({ db }) => {
    const { subscribe, getSubscribedPodcasts } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 9);
    await subscribe(1, 1);
    await subscribe(1, 12);
    await subscribe(1, 4);

    const p = await getSubscribedPodcasts(1);
    expect(p).toMatchSnapshot();
  });
});
