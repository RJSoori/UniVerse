import { describe, expect, it } from "vitest";
import { getGradesPreferringEasiest, generateCombinations } from "./combinations";
import { getGradePoint } from "./gpaPrediction";
import type { PlannerSubject } from "../types";

describe("getGradesPreferringEasiest", () => {
  it("returns grades sorted by point value ascending", () => {
    const grades = getGradesPreferringEasiest(4.0);
    for (let i = 1; i < grades.length; i++) {
      expect(getGradePoint(grades[i], 4.0)).toBeGreaterThanOrEqual(
        getGradePoint(grades[i - 1], 4.0),
      );
    }
  });

  it("starts with F (0 points)", () => {
    const grades = getGradesPreferringEasiest(4.0);
    expect(getGradePoint(grades[0], 4.0)).toBe(0);
  });

  it("ends with highest grade", () => {
    const grades = getGradesPreferringEasiest(4.0);
    expect(getGradePoint(grades[grades.length - 1], 4.0)).toBe(4.0);
  });

  it("includes 4.2 A+ on extended scale", () => {
    const grades = getGradesPreferringEasiest(4.2);
    expect(getGradePoint(grades[grades.length - 1], 4.2)).toBe(4.2);
  });

  it("deduplicates equivalent grades (D+ and D both = 1.0)", () => {
    const grades = getGradesPreferringEasiest(4.0);
    const dGrades = grades.filter((g) => getGradePoint(g, 4.0) === 1.0);
    expect(dGrades.length).toBe(1);
  });
});

describe("generateCombinations", () => {
  const makeSubject = (id: string, credits: number): PlannerSubject => ({
    id,
    name: id,
    credits,
    grade: "C",
    category: "general",
  });

  it("finds combinations that achieve required SGPA", () => {
    const subjects = [makeSubject("s1", 3), makeSubject("s2", 3)];
    const results = generateCombinations(subjects, 3.0, 4.0);
    for (const combo of results) {
      const totalPoints = combo.reduce(
        (sum, { subject, grade }) => sum + getGradePoint(grade, 4.0) * subject.credits,
        0,
      );
      expect(totalPoints).toBeGreaterThanOrEqual(3.0 * 6);
    }
  });

  it("returns empty for impossible SGPA", () => {
    const subjects = [makeSubject("s1", 3)];
    const results = generateCombinations(subjects, 5.0, 4.0);
    expect(results.length).toBe(0);
  });

  it("respects locked grades", () => {
    const subjects: PlannerSubject[] = [
      { ...makeSubject("s1", 3), lockedGrade: "A" },
      makeSubject("s2", 3),
    ];
    const results = generateCombinations(subjects, 3.5, 4.0);
    for (const combo of results) {
      expect(combo[0].grade).toBe("A");
    }
  });

  it("respects maxResults limit", () => {
    const subjects = [
      makeSubject("s1", 3),
      makeSubject("s2", 3),
      makeSubject("s3", 3),
    ];
    const results = generateCombinations(subjects, 2.0, 4.0, 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("returns only empty combinations for no subjects", () => {
    const results = generateCombinations([], 3.0, 4.0);
    expect(results.length).toBe(1);
    expect(results[0]).toEqual([]);
  });
});
