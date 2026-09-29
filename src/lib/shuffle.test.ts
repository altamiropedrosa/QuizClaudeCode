import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("retorna uma permutação sem mutar a entrada", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    const result = shuffle(input);
    expect(input).toEqual(copy);
    expect([...result].sort((a, b) => a - b)).toEqual(copy);
  });

  it("é determinístico com rng injetado", () => {
    const rng = () => 0;
    expect(shuffle([1, 2, 3, 4], rng)).toEqual([2, 3, 4, 1]);
  });
});
