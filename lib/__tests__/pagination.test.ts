import { describe, it, expect } from "vitest";
import { getPageInfo, parsePageParam } from "../pagination";

describe("parsePageParam", () => {
  it("reads a positive integer", () => {
    expect(parsePageParam("3")).toBe(3);
  });

  it.each([undefined, "", "0", "-2", "2.5", "abc", "1e3", " 2"])(
    "falls back to page 1 for %j",
    (value) => {
      expect(parsePageParam(value)).toBe(1);
    }
  );

  it("uses the first value when the param is repeated", () => {
    expect(parsePageParam(["4", "9"])).toBe(4);
  });

  it("rejects numbers too large to be a real page", () => {
    expect(parsePageParam("99999999999999999999")).toBe(1);
  });
});

describe("getPageInfo", () => {
  it("computes skip/take for a middle page", () => {
    expect(getPageInfo(2, 45, 20)).toEqual({ page: 2, pageCount: 3, skip: 20, take: 20 });
  });

  it("clamps a page past the end to the last page", () => {
    expect(getPageInfo(9, 45, 20)).toEqual({ page: 3, pageCount: 3, skip: 40, take: 20 });
  });

  it("treats an exact multiple as full pages, not an extra empty one", () => {
    expect(getPageInfo(3, 40, 20)).toEqual({ page: 2, pageCount: 2, skip: 20, take: 20 });
  });

  it("always has at least one page, even when empty", () => {
    expect(getPageInfo(1, 0, 20)).toEqual({ page: 1, pageCount: 1, skip: 0, take: 20 });
  });

  it("clamps page 0 or negatives to the first page", () => {
    expect(getPageInfo(0, 45, 20).page).toBe(1);
    expect(getPageInfo(-5, 45, 20).page).toBe(1);
  });
});
