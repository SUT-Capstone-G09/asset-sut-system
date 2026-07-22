import { describe, expect, it } from "vitest";
import { groupConsecutiveDates, formatThaiOfficialDate } from "./thaiDate";

describe("groupConsecutiveDates", () => {
  it("groups calendar-consecutive dates into one range, even across a month boundary", () => {
    expect(groupConsecutiveDates(["2026-07-30", "2026-07-31", "2026-08-01"])).toEqual([
      { start: "2026-07-30", end: "2026-08-01" },
    ]);
  });

  it("keeps non-adjacent dates as separate single-day ranges", () => {
    expect(groupConsecutiveDates(["2026-08-02", "2026-08-04", "2026-08-06"])).toEqual([
      { start: "2026-08-02", end: "2026-08-02" },
      { start: "2026-08-04", end: "2026-08-04" },
      { start: "2026-08-06", end: "2026-08-06" },
    ]);
  });

  it("sorts and dedupes regardless of input order", () => {
    expect(groupConsecutiveDates(["2026-07-30", "2026-07-29", "2026-07-30"])).toEqual([
      { start: "2026-07-29", end: "2026-07-30" },
    ]);
  });
});

describe("formatThaiOfficialDate — base case (1 day)", () => {
  it("omits the leading 'วันที่' when not a command document", () => {
    expect(formatThaiOfficialDate(["2026-07-29"], false)).toBe("29 กรกฎาคม พ.ศ. 2569");
  });

  it("adds the leading 'วันที่' for a command document", () => {
    expect(formatThaiOfficialDate(["2026-07-29"], true)).toBe("วันที่ 29 กรกฎาคม พ.ศ. 2569");
  });
});

describe("formatThaiOfficialDate — same month & year", () => {
  it("renders a continuous run as 'ระหว่างวันที่ ... ถึงวันที่ ...'", () => {
    expect(formatThaiOfficialDate(["2026-07-29", "2026-07-30", "2026-07-31"])).toBe(
      "ระหว่างวันที่ 29 ถึงวันที่ 31 กรกฎาคม พ.ศ. 2569"
    );
  });

  it("renders non-continuous days as a comma+และ list", () => {
    expect(formatThaiOfficialDate(["2026-07-01", "2026-07-03", "2026-07-05"])).toBe(
      "วันที่ 1, 3 และ 5 กรกฎาคม พ.ศ. 2569"
    );
  });

  it("renders exactly two non-continuous days joined by 'และ' with no comma", () => {
    expect(formatThaiOfficialDate(["2026-07-01", "2026-07-03"])).toBe(
      "วันที่ 1 และ 3 กรกฎาคม พ.ศ. 2569"
    );
  });

  it("mixes a continuous range with trailing non-continuous days via 'และวันที่'", () => {
    expect(formatThaiOfficialDate(["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-05", "2026-07-07"])).toBe(
      "ระหว่างวันที่ 1 ถึงวันที่ 3 และวันที่ 5 และ 7 กรกฎาคม พ.ศ. 2569"
    );
  });
});

describe("formatThaiOfficialDate — cross month, same year", () => {
  it("labels the month on every disjoint chunk", () => {
    expect(formatThaiOfficialDate(["2026-07-29", "2026-07-30", "2026-07-31", "2026-08-02", "2026-08-04", "2026-08-06"])).toBe(
      "ระหว่างวันที่ 29 ถึงวันที่ 31 กรกฎาคม และวันที่ 2, 4 และ 6 สิงหาคม พ.ศ. 2569"
    );
  });

  it("labels the month on both ends of a single range that itself straddles the boundary", () => {
    expect(formatThaiOfficialDate(["2026-07-30", "2026-07-31", "2026-08-01", "2026-08-02"])).toBe(
      "ระหว่างวันที่ 30 กรกฎาคม ถึงวันที่ 2 สิงหาคม พ.ศ. 2569"
    );
  });
});

describe("formatThaiOfficialDate — cross year", () => {
  it("always shows พ.ศ. on both sides of a year boundary", () => {
    expect(formatThaiOfficialDate(["2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02"])).toBe(
      "ระหว่างวันที่ 30 ธันวาคม พ.ศ. 2568 ถึงวันที่ 2 มกราคม พ.ศ. 2569"
    );
  });
});

describe("formatThaiOfficialDate — edge cases", () => {
  it("returns an empty string for an empty array", () => {
    expect(formatThaiOfficialDate([])).toBe("");
  });

  it("is order-independent (accepts unsorted input)", () => {
    expect(formatThaiOfficialDate(["2026-07-31", "2026-07-29", "2026-07-30"])).toBe(
      formatThaiOfficialDate(["2026-07-29", "2026-07-30", "2026-07-31"])
    );
  });
});
