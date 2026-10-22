import { describe, expect, it } from "vitest";
import { getTargetGpaResult } from "./targetGpaCalculator";

describe("getTargetGpaResult", () => {
  it("calculates required SGPA correctly", () => {
    const result = getTargetGpaResult(3.0, 60, 15, 3.2, 4.0);
    expect(result.isFeasible).toBe(true);
    expect(result.requiredSgpa).toBeGreaterThan(3.0);
  });

  it("identifies impossible targets", () => {
    const result = getTargetGpaResult(2.0, 90, 15, 4.0, 4.0);
    expect(result.isFeasible).toBe(false);
    expect(result.difficulty).toBe("IMPOSSIBLE");
  });

  it("identifies achievable targets", () => {
    const result = getTargetGpaResult(3.0, 30, 15, 3.1, 4.0);
    expect(result.isFeasible).toBe(true);
    expect(result.difficulty).toBe("ACHIEVABLE");
  });

  it("identifies very hard targets", () => {
    const result = getTargetGpaResult(3.0, 60, 15, 3.2, 4.0);
    expect(result.isFeasible).toBe(true);
    expect(result.difficulty).toBe("VERY HARD");
  });

  it("identifies challenging targets", () => {
    const result = getTargetGpaResult(3.0, 60, 15, 3.16, 4.0);
    expect(result.isFeasible).toBe(true);
    expect(result.difficulty).toBe("CHALLENGING");
  });

  it("calculates max possible CGPA correctly", () => {
    const result = getTargetGpaResult(3.0, 60, 15, 3.5, 4.0);
    expect(result.maxPossibleCgpa).toBeGreaterThan(3.0);
    expect(result.maxPossibleCgpa).toBeLessThanOrEqual(4.0);
  });

  it("handles 4.2 scale", () => {
    const result = getTargetGpaResult(3.5, 60, 15, 3.6, 4.2);
    expect(result.isFeasible).toBe(true);
    expect(result.maxPossibleCgpa).toBeLessThanOrEqual(4.2);
  });

  it("provides meaningful message for impossible targets", () => {
    const result = getTargetGpaResult(2.0, 90, 15, 4.0, 4.0);
    expect(result.message).toContain("not achievable");
    expect(result.insight).toContain("Maximum possible");
  });
});
