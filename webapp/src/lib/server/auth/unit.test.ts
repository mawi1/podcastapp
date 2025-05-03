import { describe, expect, test } from "vitest";

import { Credentials, NewUser } from ".";
import { createFormdata } from "./test-utils";

describe("NewUser", () => {
  test.each([
    [null, "234234453"],
    ["username", null],
    [null, null],
  ])("username and password cannot be null, %s %s", (u, p) => {
    const result = NewUser.fromFormData(createFormdata(u, p));

    expect(result.isErr()).toBeTruthy();
    expect(result._unsafeUnwrapErr()).toBe("Username and/or passwort cannot be null.");
  });

  test.each(["", "4lsdfgopi4ß23i923ß89028349290832984kskdjfiouoioidp2"])(
    "username must be between 1 and 50 characters",
    (u) => {
      const result = NewUser.fromFormData(createFormdata(u, "89fsdfiooij"));

      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toBe("Username must be between 1 and 50 characters.");
    }
  );

  test.each(["", "1234567", "vkmYnjI6%G&gS!rJ3eCylKt3gP_NX4Ow$HgTtdXsZaozmDsYndSUE:5HJrWdB&;24"])(
    "password must be between 8 and 64 characters",
    (p) => {
      const result = NewUser.fromFormData(createFormdata("user333", p));

      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toBe("Password must be between 8 and 64 characters.");
    }
  );

  test.each([
    ["A", "zzzzzzzz"],
    ["sfsdf43534fgertewt43skppasfpsdofosfosifopsidfopo4k", "zzzzzzzz"],
    ["A", "vkmYnjI6%G&gS!rJ3eCylKt3gP_NX4Ow$HgTtdXsZaozmsYndSUE:5HJrWdB&;24"],
    [
      "sfsdf43534fgertewt43skppasfpsdofosfosifopsidfopo4k",
      "vkmYnjI6%G&gS!rJ3eCylKt3gP_NX4Ow$HgTtdXsZaozmsYndSUE:5HJrWdB&;24",
    ],
  ])("valid Newuser", (u, p) => {
    const result = NewUser.fromFormData(createFormdata(u, p));
    expect(result.isOk()).toBeTruthy();
    expect(result._unsafeUnwrap().username).toBe(u);
  });

  test("password hash", async () => {
    const newUser = NewUser.fromFormData(createFormdata("user5555", "uhsteo36fg"))._unsafeUnwrap();
    const hash = await newUser.passwordHash();

    expect(hash.length).toBeGreaterThan(1);
    expect(hash).toContain("argon2id");
  });
});

describe("Credentials", () => {
  test("username", () => {
    const credentials = Credentials.fromFormData(
      createFormdata("Steven", "asdfooipoiio")
    )._unsafeUnwrap();

    expect(credentials.username).toBe("Steven");
  });

  test.each([
    ["egaRyaquAter", true],
    ["sfgfgdsfgdsfg", false],
    ["32423656zz", false],
  ])("verify password %s", async (p, expected) => {
    const credentials = Credentials.fromFormData(createFormdata("Steven", p))._unsafeUnwrap();
    const hash =
      "$argon2id$v=19$m=19456,t=2,p=1$4QC8ZhNdxZjuP8ERN7HPyA$TLNq/wxgLOvVposruvTlFeSfRJUsqaQlX1MwhAH0Xkc";
    const result = await credentials.verifyHash(hash);

    expect(result).toBe(expected);
  });
});
