import { describe, expect, test } from "vitest";

import { Id, InitialSymbol, PageNo, parseInitialSymbol } from ".";

describe("PageNo", () => {
  test("no search params means page 1", () => {
    const result = PageNo.fromUrl(new URL("http://example.com/foo"));
    expect(result.isOk()).toBeTruthy();
    expect(result._unsafeUnwrap().pageNo).toBe(1);
  });

  test("valid number", () => {
    const result = PageNo.fromUrl(new URL("http://example.com/foo?page=5"));
    expect(result.isOk()).toBeTruthy();
    expect(result._unsafeUnwrap().pageNo).toBe(5);
  });

  test("no number", () => {
    const result = PageNo.fromUrl(new URL("http://example.com/foo?page=bar"));
    expect(result.isErr()).toBeTruthy();
  });

  test("number smaller than 1", () => {
    const result = PageNo.fromUrl(new URL("http://example.com/foo?page=0"));
    expect(result.isErr()).toBeTruthy();
  });

  test("max int", () => {
    const result = PageNo.fromUrl(new URL("http://example.com/foo?page=9007199254740991"));
    expect(result.isOk()).toBeTruthy();
    expect(result._unsafeUnwrap().pageNo).toBe(9007199254740991);
  });

  test("greater than max int", () => {
    const result = PageNo.fromUrl(new URL("http://example.com/foo?page=9007199254740992"));
    expect(result.isErr()).toBeTruthy();
  });
});

describe("Id", () => {
  test("valid number", () => {
    const result = Id.fromStr("23445");
    expect(result.isOk()).toBeTruthy();
    expect(result._unsafeUnwrap().id).toBe(23445);
  });

  test("no number", () => {
    const result = Id.fromStr("hallo");
    expect(result.isErr()).toBeTruthy();
  });

  test("number smaller than 0", () => {
    const result = Id.fromStr("-1");
    expect(result.isErr()).toBeTruthy();
  });

  test("max int", () => {
    const result = Id.fromStr("9007199254740991");
    expect(result.isOk()).toBeTruthy();
    expect(result._unsafeUnwrap().id).toBe(9007199254740991);
  });

  test("greater than max int", () => {
    const result = Id.fromStr("9007199254740992");
    expect(result.isErr()).toBeTruthy();
  });
});

describe("InitialSymbol", () => {
  test("letter", () => {
    const result = parseInitialSymbol("G");
    expect(result).toBeDefined();
    expect(result).toBe(InitialSymbol.G);
  });

  test("numeric", () => {
    const result = parseInitialSymbol("0-9");
    expect(result).toBeDefined();
    expect(result).toBe(InitialSymbol.Numeric);
  });

  test("other", () => {
    const result = parseInitialSymbol("Other");
    expect(result).toBeDefined();
    expect(result).toBe(InitialSymbol.Other);
  });

  test("invalid", () => {
    const result = parseInitialSymbol("Foo");
    expect(result).toBeUndefined();
  });
});
