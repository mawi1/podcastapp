import { describe, expect } from "vitest";

import { PageNo } from "$lib/models";

import { dbTest, insertTestPodcasts, insertTestUser } from "../db-test";

describe("feed", () => {
  dbTest.for([
    {
      searchParams: "?page=1",
    },
    {
      searchParams: "?page=2",
    },
    {
      searchParams: "?page=6",
    },
    {
      searchParams: "?page=7",
    },
  ])("get feed %s", async ({ searchParams }, { db }) => {
    const { getFeed } = await import(".");
    const { addToPlaylist } = await import("../playlist");
    const { subscribe } = await import("../subscription");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 1);
    await subscribe(1, 6);
    await subscribe(1, 9);
    await subscribe(1, 11);
    await addToPlaylist(1, 1622);
    await addToPlaylist(1, 1191);

    const f = await getFeed(
      1,
      PageNo.fromUrl(new URL(`http://www.example.com/podcast/${searchParams}`))._unsafeUnwrap()
    );
    expect(f).toMatchSnapshot();
  });
});
