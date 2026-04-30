import { describe, expect, it } from "vitest";
import { plural } from "./pluralize";

const FORMS: [string, string, string] = ["день", "дня", "дней"];

describe("plural — core Russian forms", () => {
  it("0 → many", () => expect(plural(0, FORMS)).toBe("дней"));
  it("1 → one", () => expect(plural(1, FORMS)).toBe("день"));
  it("2 → few", () => expect(plural(2, FORMS)).toBe("дня"));
  it("4 → few", () => expect(plural(4, FORMS)).toBe("дня"));
  it("5 → many", () => expect(plural(5, FORMS)).toBe("дней"));
  it("10 → many", () => expect(plural(10, FORMS)).toBe("дней"));
});

describe("plural — teens (special exception 11–14 → many)", () => {
  it("11 → many", () => expect(plural(11, FORMS)).toBe("дней"));
  it("12 → many", () => expect(plural(12, FORMS)).toBe("дней"));
  it("13 → many", () => expect(plural(13, FORMS)).toBe("дней"));
  it("14 → many", () => expect(plural(14, FORMS)).toBe("дней"));
});

describe("plural — large numbers fall back to last digit", () => {
  it("21 → one", () => expect(plural(21, FORMS)).toBe("день"));
  it("22 → few", () => expect(plural(22, FORMS)).toBe("дня"));
  it("25 → many", () => expect(plural(25, FORMS)).toBe("дней"));
  it("101 → one", () => expect(plural(101, FORMS)).toBe("день"));
  it("111 → many (teen exception even at 100s)", () =>
    expect(plural(111, FORMS)).toBe("дней"));
  it("112 → many", () => expect(plural(112, FORMS)).toBe("дней"));
  it("122 → few", () => expect(plural(122, FORMS)).toBe("дня"));
  it("1000 → many", () => expect(plural(1000, FORMS)).toBe("дней"));
});

describe("plural — negative & edge", () => {
  it("-1 → one (abs)", () => expect(plural(-1, FORMS)).toBe("день"));
  it("-12 → many (teen exception holds for negatives)", () =>
    expect(plural(-12, FORMS)).toBe("дней"));
});
