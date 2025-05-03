import { count, eq } from "drizzle-orm";
import { describe, expect } from "vitest";

import { dbTest, insertTestUser } from "../db-test";
import { session, user } from "../schema";
import { createFormdata } from "./test-utils";

describe("auth", () => {
  dbTest.for([
    { username: "testuser", expected: false },
    { username: "Markus", expected: true },
  ])("is username available %s", async ({ username, expected }, { db }) => {
    const { isUsernameAvailable } = await import(".");

    await insertTestUser(db);
    const result = await isUsernameAvailable(username);

    expect(result).toBe(expected);
  });

  dbTest("reagister user", async ({ db }) => {
    const { NewUser, registerUser } = await import(".");

    const newUser = NewUser.fromFormData(
      createFormdata("username", "123strongpass")
    )._unsafeUnwrap();
    const result = await registerUser(newUser);

    expect(result.isOk()).toBeTruthy();
    const rows = (
      await db.select({ count: count() }).from(user).where(eq(user.username, "username"))
    )[0].count;
    expect(rows).toBe(1);
  });

  dbTest("register user with existing username", async ({ db }) => {
    const { NewUser, registerUser } = await import(".");

    await insertTestUser(db);

    const newUser = NewUser.fromFormData(createFormdata("testuser", "123456789"))._unsafeUnwrap();
    const result = await registerUser(newUser);

    expect(result.isErr()).toBeTruthy();
    expect(result._unsafeUnwrapErr()).toBe("Username not available.");
  });

  dbTest("login valid credentials", async ({ db }) => {
    const { Credentials, loginUser } = await import(".");

    await insertTestUser(db);

    const credentials = Credentials.fromFormData(
      createFormdata("testuser", "password111")
    )._unsafeUnwrap();
    const result = await loginUser(credentials);

    expect(result.isOk()).toBeTruthy();
    const cookie = result._unsafeUnwrap();
    expect(cookie.name).toBe("auth_session");
    expect(cookie.value.length).toBeGreaterThan(1);

    const rows = (
      await db.select({ count: count() }).from(session).where(eq(session.id, cookie.value))
    )[0].count;
    expect(rows).toBe(1);
  });

  dbTest.for([
    ["user", "password111"],
    ["testuser", "foo"],
  ])("login invalid credentials, %s %s", async ([u, p], { db }) => {
    const { Credentials, loginUser } = await import(".");

    await insertTestUser(db);

    const credentials = Credentials.fromFormData(createFormdata(u, p))._unsafeUnwrap();
    const result = await loginUser(credentials);

    expect(result.isErr()).toBeTruthy();
    expect(result._unsafeUnwrapErr()).toBe("Invalid username or password.");

    const rows = (await db.select({ count: count() }).from(session))[0].count;
    expect(rows).toBe(0);
  });

  dbTest("logout", async ({ db }) => {
    const { Credentials, loginUser, logoutUser } = await import(".");

    await insertTestUser(db);
    const credentials = Credentials.fromFormData(
      createFormdata("testuser", "password111")
    )._unsafeUnwrap();
    const sessionId = (await loginUser(credentials))._unsafeUnwrap().value;

    const rows = (
      await db.select({ count: count() }).from(session).where(eq(session.id, sessionId))
    )[0].count;
    expect(rows).toBe(1);

    const cookie = await logoutUser(sessionId);
    expect(cookie.name).toBe("auth_session");
    expect(cookie.value).toBe("");
    expect(cookie.attributes.maxAge).toBe(0);

    const rowsAfterLogout = (
      await db.select({ count: count() }).from(session).where(eq(session.id, sessionId))
    )[0].count;
    expect(rowsAfterLogout).toBe(0);
  });
});
