import { and, eq } from "drizzle-orm";

import db from "../db";
import { resumeData as resumeDataTable } from "../schema";
import type { ResumeData } from "$lib/models";

export async function setResumeData(
  userId: number,
  episodeId: number,
  resumeData: ResumeData,
): Promise<void> {
  await db
    .insert(resumeDataTable)
    .values({ userId, episodeId, currentTime: resumeData.currentTime, playbackRate: resumeData.playbackRate })
    .onConflictDoUpdate({
      target: [resumeDataTable.userId, resumeDataTable.episodeId],
      set: {
        currentTime: resumeData.currentTime,
        playbackRate: resumeData.playbackRate,
      },
    });
}

export async function deleteResumeData(userId: number, episodeId: number): Promise<void> {
  await db
    .delete(resumeDataTable)
    .where(and(eq(resumeDataTable.userId, userId), eq(resumeDataTable.episodeId, episodeId)));
}
