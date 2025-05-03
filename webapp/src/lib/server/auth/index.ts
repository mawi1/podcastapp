import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { hash, verify } from "@node-rs/argon2";
import { count, eq } from "drizzle-orm";
import { Cookie, Lucia } from "lucia";
import { Result, err, ok } from "neverthrow";
import pg from "pg";

import { dev } from "$app/environment";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH } from "$lib/constants";

import db from "../db";
import { session, user } from "../schema";

const HASH_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
  }
}

const adapter = new DrizzlePostgreSQLAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev,
    },
  },
});

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const rows = await db.select({ value: count() }).from(user).where(eq(user.username, username));
  return rows[0].value === 0;
}

function extractFormData(data: FormData): Result<{ username: string; password: string }, string> {
  const fUsername = data.get("username");
  const fPassword = data.get("password");

  if (fUsername === null || fPassword === null) {
    return err("Username and/or passwort cannot be null.");
  }
  if (typeof fUsername !== "string" || typeof fPassword !== "string") {
    return err("invalid form data");
  }
  return ok({ username: fUsername.toString(), password: fPassword.toString() });
}

export class NewUser {
  private _username: string;
  private _password: string;

  private constructor(username: string, password: string) {
    this._username = username;
    this._password = password;
  }

  public static fromFormData(data: FormData): Result<NewUser, string> {
    const res = extractFormData(data);
    if (res.isErr()) {
      return err(res.error);
    }
    const { username, password } = res.value;

    if (username.length < 1 || username.length > USERNAME_MAX_LENGTH) {
      return err(`Username must be between 1 and ${USERNAME_MAX_LENGTH} characters.`);
    }
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      return err(
        `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
      );
    }

    return ok(new NewUser(username, password));
  }

  get username(): string {
    return this._username;
  }

  passwordHash(): Promise<string> {
    return hash(this._password, HASH_OPTS);
  }
}

export async function registerUser(newUser: NewUser): Promise<Result<Cookie, string>> {
  const hash = await newUser.passwordHash();
  let res;
  try {
    res = await db
      .insert(user)
      .values({ username: newUser.username, passwordHash: hash })
      .returning({ id: user.id });
  } catch (error: unknown) {
    if (error instanceof pg.DatabaseError && error.constraint === "user__username__unique") {
      return err("Username not available.");
    } else {
      throw error;
    }
  }
  const userId = res[0].id;
  const session = await lucia.createSession(userId, {});
  return ok(lucia.createSessionCookie(session.id));
}

export class Credentials {
  private _username: string;
  private _password: string;

  private constructor(username: string, password: string) {
    this._username = username;
    this._password = password;
  }

  public static fromFormData(data: FormData): Result<Credentials, string> {
    const res = extractFormData(data);
    if (res.isErr()) {
      return err(res.error);
    }
    const { username, password } = res.value;
    return ok(new Credentials(username, password));
  }

  get username(): string {
    return this._username;
  }

  async verifyHash(hash: string): Promise<boolean> {
    return verify(hash, this._password, HASH_OPTS);
  }
}

export async function loginUser(credentials: Credentials): Promise<Result<Cookie, string>> {
  const dbUser = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.username, credentials.username),
  });
  if (dbUser !== undefined && (await credentials.verifyHash(dbUser.passwordHash))) {
    const session = await lucia.createSession(dbUser.id, {});
    return ok(lucia.createSessionCookie(session.id));
  } else {
    return err("Invalid username or password.");
  }
}

export async function logoutUser(sessionId: string): Promise<Cookie> {
  await lucia.invalidateSession(sessionId);
  return lucia.createBlankSessionCookie();
}
