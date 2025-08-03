import { and, eq } from "drizzle-orm";
import { describe, expect } from "vitest";

import { type DB, dbTest, insertTestPodcasts, insertTestUser } from "../db-test";
import { resumeData } from "../schema";

async function getResumeData(
  db: DB,
  userId: number,
  episodeId: number
): Promise<
  { userId: number; episodeId: number; currentTime: number; playbackRate: number } | undefined
> {
  return await db.query.resumeData.findFirst({
    where: and(eq(resumeData.userId, userId),eq(resumeData.episodeId, episodeId)),
  });
}

describe("resume data", () => {
  dbTest("set", async ({ db }) => {
    const { setResumeData } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    await setResumeData(1, 138, {currentTime: 5.89, playbackRate: 1.5});
    const rd = await getResumeData(db, 1, 138);
    expect(rd).toBeDefined();
    expect(rd!.userId).toBe(1);
    expect(rd!.episodeId).toBe(138);
    expect(rd!.currentTime).toBe(5.89);
    expect(rd!.playbackRate).toBe(1.5);
  });

  dbTest("upsert", async ({ db }) => {
    const { setResumeData } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await setResumeData(1, 138, {currentTime: 36.95, playbackRate: 2});
    
    await setResumeData(1, 138, {currentTime: 1636.95, playbackRate: 1});
    const rd = await getResumeData(db, 1, 138);
    expect(rd).toBeDefined();
    expect(rd!.userId).toBe(1);
    expect(rd!.episodeId).toBe(138);
    expect(rd!.currentTime).toBe(1636.95);
    expect(rd!.playbackRate).toBe(1);
  });

  dbTest("delete", async ({ db }) => {
    const { setResumeData, deleteResumeData } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await setResumeData(1, 138, {currentTime: 36.95, playbackRate: 2});
    
    const rd = await getResumeData(db, 1, 138);
    expect(rd).toBeDefined();
    await deleteResumeData(1, 138);
    const res = await getResumeData(db, 1, 138);
    expect(res).toBeUndefined();
  });
});
