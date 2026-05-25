import { describe, expect, it } from "vitest";
import {
  getGradePoint,
  calculateSemesterGpa,
  calculateCgpa,
  getEffectiveGpaScale,
  generateInsightMessage,
} from "./gpaPrediction";
import type { Semester, GpaSettings } from "../types";

const defaultSettings: GpaSettings = {
  gradingMode: "standard",
  gpaScale: 4.0,
  degreeClasses: {
    firstClass: 3.7,
    secondUpper: 3.3,
    secondLower: 3.0,
    general: 2.0,
  },
};

describe("getGradePoint", () => {
  it("returns correct points on 4.0 scale", () => {
    expect(getGradePoint("A+", 4.0)).toBe(4.0);
    expect(getGradePoint("A", 4.0)).toBe(4.0);
    expect(getGradePoint("A-", 4.0)).toBe(3.7);
    expect(getGradePoint("B+", 4.0)).toBe(3.3);
    expect(getGradePoint("B", 4.0)).toBe(3.0);
    expect(getGradePoint("F", 4.0)).toBe(0.0);
  });

  it("returns 4.2 for A+ on 4.2 scale", () => {
    expect(getGradePoint("A+", 4.2)).toBe(4.2);
  });

  it("returns 0 for unknown grades", () => {
    expect(getGradePoint("Z", 4.0)).toBe(0);
  });
});

describe("calculateSemesterGpa", () => {
  it("calculates weighted GPA correctly", () => {
    const subjects = [
      { grade: "A", credits: 3, isGpa: true },
      { grade: "B", credits: 3, isGpa: true },
    ];
    const result = calculateSemesterGpa(subjects, 4.0);
    expect(result).toBe(3.5);
  });

  it("handles single subject", () => {
    const subjects = [{ grade: "A-", credits: 4, isGpa: true }];
    expect(calculateSemesterGpa(subjects, 4.0)).toBe(3.7);
  });

  it("returns 0 for no subjects", () => {
    expect(calculateSemesterGpa([], 4.0)).toBe(0);
  });

  it("excludes non-GPA subjects", () => {
    const subjects = [
      { grade: "A", credits: 3, isGpa: true },
      { grade: "F", credits: 3, isGpa: false },
    ];
    expect(calculateSemesterGpa(subjects, 4.0)).toBe(4.0);
  });

  it("handles mixed credit weights", () => {
    const subjects = [
      { grade: "A", credits: 4, isGpa: true },
      { grade: "C", credits: 2, isGpa: true },
    ];
    expect(calculateSemesterGpa(subjects, 4.0)).toBe(3.333);
  });
});

describe("calculateCgpa", () => {
  it("calculates across multiple semesters", () => {
    const semesters: Semester[] = [
      {
        id: "1",
        year: "Year 1",
        semester: "Semester 1",
        subjects: [
          { id: "s1", name: "Math", credits: 3, grade: "A", isGpa: true },
        ],
      },
      {
        id: "2",
        year: "Year 1",
        semester: "Semester 2",
        subjects: [
          { id: "s2", name: "Science", credits: 3, grade: "B", isGpa: true },
        ],
      },
    ];
    expect(calculateCgpa(semesters, 4.0)).toBe(3.5);
  });

  it("returns 0 for empty semesters", () => {
    expect(calculateCgpa([], 4.0)).toBe(0);
  });
});

describe("getEffectiveGpaScale", () => {
  it("returns explicit gpaScale when set", () => {
    expect(getEffectiveGpaScale({ ...defaultSettings, gpaScale: 4.2 })).toBe(4.2);
  });

  it("infers 4.0 from standard gradingMode", () => {
    const settings = { ...defaultSettings, gpaScale: undefined as any };
    expect(getEffectiveGpaScale(settings)).toBe(4.0);
  });

  it("infers 4.2 from extended gradingMode", () => {
    const settings = { ...defaultSettings, gradingMode: "extended", gpaScale: undefined as any };
    expect(getEffectiveGpaScale(settings)).toBe(4.2);
  });
});

describe("generateInsightMessage", () => {
  it("congratulates first class standing", () => {
    const msg = generateInsightMessage(
      { firstClass: 100, secondUpper: 0, secondLower: 0, general: 0 },
      3.8,
      2,
      defaultSettings.degreeClasses,
    );
    expect(msg).toContain("Congratulations");
  });

  it("guides second upper students", () => {
    const msg = generateInsightMessage(
      { firstClass: 0, secondUpper: 100, secondLower: 0, general: 0 },
      3.4,
      2,
      defaultSettings.degreeClasses,
    );
    expect(msg).toContain("performing well");
  });

  it("encourages new students with zero CGPA", () => {
    const msg = generateInsightMessage(
      { firstClass: 0, secondUpper: 0, secondLower: 0, general: 100 },
      0,
      4,
      defaultSettings.degreeClasses,
    );
    expect(msg).toContain("first semester");
  });
});
