import { describe, expect } from "vitest";

import { Id, InitialSymbol } from "$lib/models";

import { dbTest, insertTestPodcasts, insertTestUser } from "../db-test";

describe("podcasts", () => {
  dbTest("get by id", async ({ db }) => {
    const { getPodcastById } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    const p = await getPodcastById(1, Id.fromStr("4")._unsafeUnwrap());
    expect(p).toMatchSnapshot();
  });

  dbTest("get by id subscribed", async ({ db }) => {
    const { getPodcastById } = await import(".");
    const { subscribe } = await import("../subscription");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 3);

    const p = await getPodcastById(1, Id.fromStr("3")._unsafeUnwrap());
    expect(p).toMatchSnapshot();
  });

  dbTest("get by initial symbol alphabetic", async ({ db }) => {
    const { getPodcastsByInitialSymbol } = await import(".");
    const { subscribe } = await import("../subscription");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 8);

    const p = await getPodcastsByInitialSymbol(1, InitialSymbol.T);
    expect(p).toMatchSnapshot();
  });

  dbTest("get by initial symbol numeric", async ({ db }) => {
    const { getPodcastsByInitialSymbol } = await import(".");
    const { subscribe } = await import("../subscription");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 10);

    const p = await getPodcastsByInitialSymbol(1, InitialSymbol.Numeric);
    expect(p).toMatchSnapshot();
  });

  dbTest("get by initial symbol other", async ({ db }) => {
    const { getPodcastsByInitialSymbol } = await import(".");
    const { subscribe } = await import("../subscription");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 12);

    const p = await getPodcastsByInitialSymbol(1, InitialSymbol.Other);
    expect(p).toMatchSnapshot();
  });

  dbTest("search empty query string", async ({ db }) => {
    const { searchPodcasts } = await import(".");

    await insertTestUser(db);
    await insertTestPodcasts(db);

    const p = await searchPodcasts(1, "");
    expect(p.length).toBe(0);
  });

  dbTest("search", async ({ db }) => {
    const { searchPodcasts } = await import(".");
    const { subscribe } = await import("../subscription");

    await insertTestUser(db);
    await insertTestPodcasts(db);
    await subscribe(1, 5);

    const p = await searchPodcasts(1, "tech");
    expect(p).toMatchSnapshot();
  });
});
