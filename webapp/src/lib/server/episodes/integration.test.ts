import { describe, expect } from "vitest";

import { Id, PageNo } from "$lib/models";

import { dbTest, insertTestPodcasts, insertTestUser } from "../db-test";

describe("episodes", () => {
  dbTest("by id", async ({ db }) => {
    const { getEpisodeById } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    const e = await getEpisodeById(1, Id.fromStr("343")._unsafeUnwrap());
    expect(e).toMatchSnapshot();
  });

  dbTest("by id, on playlist", async ({ db }) => {
    const { getEpisodeById } = await import(".");
    const { addToPlaylist } = await import("../playlist");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await addToPlaylist(1, 343);

    const e = await getEpisodeById(1, Id.fromStr("343")._unsafeUnwrap());
    expect(e).toMatchSnapshot();
  });

  dbTest.for([
    {
      searchParams: "?page=1",
    },
    {
      searchParams: "?page=3",
    },
    {
      searchParams: "?page=6",
    },
    {
      searchParams: "?page=7",
    },
  ])("by podcast id %s", async ({ searchParams }, { db }) => {
    const { getEpisodesByPodcastId } = await import(".");
    const { addToPlaylist } = await import("../playlist");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await addToPlaylist(1, 1469);
    await addToPlaylist(1, 1433);

    const p = await getEpisodesByPodcastId(
      1,
      Id.fromStr("10")._unsafeUnwrap(),
      PageNo.fromUrl(new URL(`http://www.example.com/podcast/${searchParams}`))._unsafeUnwrap()
    );
    expect(p).toMatchSnapshot();
  });
});
