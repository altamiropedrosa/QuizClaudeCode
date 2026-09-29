import { describe, expect, it } from "vitest";
import { isOffensive } from "./profanity";

describe("isOffensive", () => {
  it.each(["merda", "M3RDA", "caralho_dev", "fuck-it", "b0st4", "sh1t"])("bloqueia %s", (n) => {
    expect(isOffensive(n)).toBe(true);
  });

  it.each(["maria_dev", "computador", "claude-fan", "dev_2025", "bolota"])("permite %s", (n) => {
    expect(isOffensive(n)).toBe(false);
  });
});
