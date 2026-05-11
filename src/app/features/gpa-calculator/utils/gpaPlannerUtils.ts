import { PlannerSubject } from "../types";
import { getGradePoint } from "./gpaPrediction";
import {
  PlannerGrade,
  DIFFICULTY_VERY_HARD_MARGIN,
  DIFFICULTY_CHALLENGING_MARGIN,
  MAX_RECOMMENDATION_RESULTS,
} from "../constants/gradeScales";
import {
  CategoryPerformance,
  buildProbabilityModels,
  CategoryProbabilityModel,
} from "./performance";
import { scoreCombination } from "./scoring";
import { generateCombinations, getGradesPreferringEasiest } from "./combinations";
import { normalizeGrade, roundGpa } from "../../../shared/validation";

export interface CombinationResult {
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>;
  sgpa: number;
  points: number;
  score: number;
  explanation: string;
  difficulty: "IMPOSSIBLE" | "VERY HARD" | "CHALLENGING" | "ACHIEVABLE";
  strategy?: string;
  pressure?: "Low" | "Moderate" | "High";
  focusAreas?: string[];
  flexibleSubjects?: string[];
  strengthScore?: number;
}

export function getPlanDifficulty(requiredSgpa: number, gpaScale: number) {
  if (requiredSgpa > gpaScale) return "IMPOSSIBLE" as const;
  if (requiredSgpa > gpaScale - DIFFICULTY_VERY_HARD_MARGIN) return "VERY HARD" as const;
  if (requiredSgpa > gpaScale - DIFFICULTY_CHALLENGING_MARGIN) return "CHALLENGING" as const;
  return "ACHIEVABLE" as const;
}

function getPlanSignature(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  gpaScale: number,
): string {
  return combination
    .map(
      ({ subject, grade }) =>
        `${subject.id}:${normalizeGrade(grade, gpaScale) || grade}`,
    )
    .join("|");
}

function normalizePlanCombination(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  gpaScale: number,
) {
  return combination.map(({ subject, grade }) => {
    let normalized = (normalizeGrade(grade, gpaScale) || grade) as PlannerGrade;
    if (normalized === "A+" && gpaScale === 4.0) {
      normalized = "A";
    }
    return { subject, grade: normalized };
  });
}

function countTopHeavyGrades(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number,
): number {
  return combination.reduce((count, { subject, grade }) => {
    const gradePoint = getGradePoint(grade, gpaScale);
    const historicalAverage = performance[subject.category]?.average ?? gpaScale / 2;
    if (gradePoint >= 3.7 && historicalAverage < 3.0) {
      return count + 1;
    }
    return count;
  }, 0);
}

function pickDiversePlans(plans: CombinationResult[]): CombinationResult[] {
  const sorted = [...plans].sort((a, b) => {
    if (a.sgpa !== b.sgpa) return a.sgpa - b.sgpa;
    return b.score - a.score;
  });

  const selected: CombinationResult[] = [];
  for (const plan of sorted) {
    if (selected.length >= 3) break;
    const isDifferent = selected.every(
      (s) => combinationSimilarity(s.combination, plan.combination) < 0.7,
    );
    if (isDifferent) selected.push(plan);
  }

  return selected;
}

function canGradeBeDowngradedHelper(
  currentGrade: PlannerGrade,
  subject: PlannerSubject,
  otherPointsContribution: number,
  _totalOtherCredits: number,
  targetPoints: number,
  gpaScale: number
): boolean {
  const preferredGrades = getGradesPreferringEasiest(gpaScale);
  const currentIndex = preferredGrades.indexOf(currentGrade);
  if (currentIndex <= 0) return false;
  for (let i = 0; i < currentIndex; i++) {
    const easierGrade = preferredGrades[i];
    const easierPoints = getGradePoint(easierGrade, gpaScale) * subject.credits;
    if (otherPointsContribution + easierPoints >= targetPoints) return true;
  }
  return false;
}

export function calculatePlanPressure(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number
): "Low" | "Moderate" | "High" {
  if (combination.length === 0) return "Moderate";
  let aboveAverageCount = 0;
  let significantlyAboveCount = 0;
  combination.forEach(({ subject, grade }) => {
    const gradePoint = getGradePoint(grade, gpaScale);
    const historicalAvg = performance[subject.category]?.average ?? gpaScale / 2;
    if (gradePoint > historicalAvg) {
      aboveAverageCount++;
      if (gradePoint > historicalAvg + 0.3) significantlyAboveCount++;
    }
  });
  const aboveAvgRatio = aboveAverageCount / combination.length;
  const significantRatio = significantlyAboveCount / combination.length;
  if (significantRatio > 0.4) return "High";
  if (aboveAvgRatio > 0.6) return "High";
  if (aboveAvgRatio > 0.3) return "Moderate";
  return "Low";
}

export function detectPlanStrategy(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number
): "Safe" | "Balanced" | "Aggressive" {
  if (combination.length === 0) return "Balanced";
  let withinAverageCount = 0;
  combination.forEach(({ subject, grade }) => {
    const gradePoint = getGradePoint(grade, gpaScale);
    const historicalAvg = performance[subject.category]?.average ?? gpaScale / 2;
    if (gradePoint <= historicalAvg + 0.1) withinAverageCount++;
  });
  const withinRatio = withinAverageCount / combination.length;
  if (withinRatio > 0.8) return "Safe";
  if (withinRatio > 0.4) return "Balanced";
  return "Aggressive";
}

export function extractFocusAreas(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number
): string[] {
  const categoryScores: Record<string, number> = {};
  combination.forEach(({ subject, grade }) => {
    const gradePoint = getGradePoint(grade, gpaScale);
    const historicalAvg = performance[subject.category]?.average ?? gpaScale / 2;
    if (!categoryScores[subject.category]) categoryScores[subject.category] = 0;
    if (gradePoint > historicalAvg + 0.3) {
      categoryScores[subject.category] += 2;
    } else if (gradePoint > historicalAvg) {
      categoryScores[subject.category] += 1;
    }
  });
  return Object.entries(categoryScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category]) => category);
}

export function findFlexibleSubjects(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  requiredSgpa: number,
  _subjects: PlannerSubject[],
  gpaScale: number
): string[] {
  if (combination.length === 0) return [];
  const totalCredits = combination.reduce((sum, c) => sum + c.subject.credits, 0);
  const targetPoints = requiredSgpa * totalCredits;
  const flexible: string[] = [];
  combination.forEach(({ subject, grade }, index) => {
    const otherPointsContribution = combination.reduce((sum, entry, idx) => {
      if (idx !== index) return sum + getGradePoint(entry.grade, gpaScale) * entry.subject.credits;
      return sum;
    }, 0);
    const otherCredits = combination.reduce((sum, entry, idx) => {
      if (idx !== index) return sum + entry.subject.credits;
      return sum;
    }, 0);
    if (canGradeBeDowngradedHelper(grade, subject, otherPointsContribution, otherCredits, targetPoints, gpaScale)) {
      flexible.push(subject.name);
    }
  });
  return flexible;
}

function combinationSimilarity(
  a: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  b: Array<{ subject: PlannerSubject; grade: PlannerGrade }>
): number {
  let matches = 0;
  a.forEach((entryA, i) => {
    if (entryA.grade === b[i].grade) matches++;
  });
  return matches / a.length;
}

export function buildStrategyExplanation(
  _combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  _strategy: "Safe" | "Balanced" | "Aggressive",
  _pressure: "Low" | "Moderate" | "High",
  _focusAreas: string[],
  _flexibleSubjects: string[]
): string {
  return "";
}

export function buildRecommendations(
  subjects: PlannerSubject[],
  requiredSgpa: number,
  gpaScale: number,
  performance: Record<string, CategoryPerformance>,
  semesters?: any[] // Add semesters parameter for probability model building
): CombinationResult[] {
  if (subjects.length === 0) return [];
  
  // Build probability models from historical data (NEW)
  const probabilityModels = semesters ? buildProbabilityModels(semesters, gpaScale) : {};
  
  let rawCombinations = generateCombinations(subjects, requiredSgpa, gpaScale, MAX_RECOMMENDATION_RESULTS, true);
  if (rawCombinations.length === 0) {
    rawCombinations = generateCombinations(subjects, requiredSgpa, gpaScale, MAX_RECOMMENDATION_RESULTS, false);
  }
  const requiredCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const requiredPoints = requiredSgpa * requiredCredits;

  const uniqueCombinations = Array.from(
    new Map(
      rawCombinations.map((combination) => [
        getPlanSignature(combination, gpaScale),
        normalizePlanCombination(combination, gpaScale),
      ]),
    ).values(),
  );

  const scored = uniqueCombinations.map((displayCombination) => {

    const points = displayCombination.reduce(
      (sum, entry) => sum + getGradePoint(entry.grade, gpaScale) * entry.subject.credits,
      0
    );
    const sgpa = roundGpa(points / requiredCredits);
    const strategy = detectPlanStrategy(displayCombination, performance, gpaScale);
    const pressure = calculatePlanPressure(displayCombination, performance, gpaScale);
    const focusAreas = extractFocusAreas(displayCombination, performance, gpaScale);
    const flexibleSubjects = findFlexibleSubjects(displayCombination, requiredSgpa, subjects, gpaScale);
    const impracticalPenalty =
      countTopHeavyGrades(displayCombination, performance, gpaScale) * 4 +
      Math.max(0, roundGpa(sgpa - requiredSgpa)) * 10;

    return {
      combination: displayCombination,
      sgpa,
      points,
      score:
        scoreCombination(
          displayCombination,
          performance,
          gpaScale,
          requiredSgpa,
          subjects,
          probabilityModels,
        ) - impracticalPenalty,
      explanation: buildStrategyExplanation(displayCombination, strategy, pressure, focusAreas, flexibleSubjects),
      difficulty: getPlanDifficulty(requiredSgpa, gpaScale),
      strategy,
      pressure,
      focusAreas,
      flexibleSubjects,
    };
  });

  return pickDiversePlans(scored)
    .slice(0, 3);
}
