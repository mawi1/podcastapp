import { describe, expect, test } from "vitest";

import { getPaginationInfo } from "./Paginator.svelte";

describe("getPaginationInfo", () => {
  test("is undefined if all items fit on one page", () => {
    const p = getPaginationInfo(new URLSearchParams(), 10, 10);
    expect(p).toBeUndefined();
  });

  test("is defined if all items do not fit on one page", () => {
    const p = getPaginationInfo(new URLSearchParams(), 11, 10);
    expect(p).toBeDefined();
  });

  test("is undefined page > totalpages", () => {
    const p = getPaginationInfo(new URLSearchParams("page=19"), 337, 19);
    expect(p).toBeUndefined();
  });

  test("previous is undefined on page 1", () => {
    const p = getPaginationInfo(new URLSearchParams("page=1"), 587, 10);
    expect(p!.previous).toBeUndefined();
  });

  test("next is undefined on last page", () => {
    const p = getPaginationInfo(new URLSearchParams("page=82"), 983, 12);
    expect(p!.next).toBeUndefined();
  });

  test.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])("current page (%i) is active is true", (page) => {
    const p = getPaginationInfo(new URLSearchParams(`page=${page}`), 101, 10);
    expect(p!.links.find((e) => e.isActive)!.page).toBe(page);
  });

  test.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])("only one page (%i) is active is true", (page) => {
    const p = getPaginationInfo(new URLSearchParams(`page=${page}`), 101, 10);
    expect(p!.links.filter((e) => e.isActive).length).toBe(1);
  });

  test("no param -> page 1", () => {
    const p = getPaginationInfo(new URLSearchParams(), 613, 25);
    expect(p!.links[0].page).toBe(1);
  });

  test.each([
    ["page=1", 867, 16, [1, 2, 3, 4, 5]],
    ["page=2", 867, 16, [1, 2, 3, 4, 5]],
    ["page=32", 867, 16, [30, 31, 32, 33, 34]],
    ["page=41", 867, 16, [39, 40, 41, 42, 43]],
    ["page=54", 867, 16, [51, 52, 53, 54, 55]],
    ["page=55", 867, 16, [51, 52, 53, 54, 55]],
  ])("page numbers are correct for %s", (searchParams, totalItems, itemsPerPage, expected) => {
    const p = getPaginationInfo(new URLSearchParams(searchParams), totalItems, itemsPerPage);
    expect(p!.links.map((l) => l.page)).toStrictEqual(expected);
  });

  test.each([
    ["page=1", 1495, 44, "?page=2"],
    ["page=19", 1495, 44, "?page=20"],
    ["page=28", 1495, 44, "?page=29"],
  ])("next is correct for %s", (searchParams, totalItems, itemsPerPage, expected) => {
    const p = getPaginationInfo(new URLSearchParams(searchParams), totalItems, itemsPerPage);
    expect(p!.next).toBe(expected);
  });

  test.each([
    ["page=12", 5378, 57, "?page=11"],
    ["page=74", 5378, 57, "?page=73"],
    ["page=95", 5378, 57, "?page=94"],
  ])("prev is correct for %s", (searchParams, totalItems, itemsPerPage, expected) => {
    const p = getPaginationInfo(new URLSearchParams(searchParams), totalItems, itemsPerPage);
    expect(p!.previous).toBe(expected);
  });

  test.each([
    ["page=6", 3270, 25, ["?page=4", "?page=5", "?page=6", "?page=7", "?page=8"]],
    ["page=101", 3270, 25, ["?page=99", "?page=100", "?page=101", "?page=102", "?page=103"]],
    ["page=69", 3270, 25, ["?page=67", "?page=68", "?page=69", "?page=70", "?page=71"]],
  ])("hrefs are correct for %s", (searchParams, totalItems, itemsPerPage, expected) => {
    const p = getPaginationInfo(new URLSearchParams(searchParams), totalItems, itemsPerPage);
    expect(p!.links.map((l) => l.href)).toStrictEqual(expected);
  });

  test("other search params are keept", () => {
    const p = getPaginationInfo(new URLSearchParams("page=3&foo=bar"), 581, 23);
    expect(p).toMatchSnapshot();
  });
});
