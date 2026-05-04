/**
 * GPA Combination Generation Utilities
 * 
 * Uses backtracking algorithm to find grade combinations that achieve
 * a required SGPA. Optimized with early termination and sorting.
 */

import { PlannerSubject } from "../types";
import { PlannerGrade, MAX_RECOMMENDATION_RESULTS, BACKTRACK_GENERATION_LIMIT_MULTIPLIER, RECOMMENDATION_GRADE_FLOOR } from "../constants/gradeScales";
import { getGradePoint } from "./gpaPrediction";
import { normalizeGrade } from "../../../shared/validation";

export function getGradesPreferringEasiest(gpaScale: number): PlannerGrade[] {
  // All possible grades in order from hardest to easiest
  const allGrades: PlannerGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "E"];
  
  // Map each unique point value to the easiest grade achieving it
  const pointToGrade = new Map<number, PlannerGrade>();
  
  for (const grade of allGrades) {
    const points = getGradePoint(grade, gpaScale);
    // Only add if we haven't seen this point value yet (first grade is easiest)
    if (!pointToGrade.has(points)) {
      pointToGrade.set(points, grade);
    }
  }
  
  // Sort by point value ascending (lowest points first = easiest grades first)
  const result = Array.from(pointToGrade.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, grade]) => grade);
  
  return result;
}

export function generateCombinations(
  subjects: PlannerSubject[],
  requiredSgpa: number,
  gpaScale: number,
  maxResults: number = MAX_RECOMMENDATION_RESULTS,
  useExpectedGradeFloor: boolean = true
): Array<{ subject: PlannerSubject; grade: PlannerGrade }[]> {
  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const requiredPoints = requiredSgpa * totalCredits;
  const maxGradePoint = getGradePoint("A+", gpaScale);
  const results: Array<{ subject: PlannerSubject; grade: PlannerGrade }[]> = [];
  const seenSignatures = new Set<string>();
  
  // Get grades in preference order (easiest first due to equivalence detection)
  const gradesInPreferenceOrder = getGradesPreferringEasiest(gpaScale);
  
  // Filter to grades at or above the recommendation floor (exclude F/E grades)
  const floorPoints = getGradePoint(RECOMMENDATION_GRADE_FLOOR, gpaScale);
  const globalUsableGrades = gradesInPreferenceOrder.filter(
    g => getGradePoint(g, gpaScale) >= floorPoints
  );

  function getSubjectGrades(subject: PlannerSubject): PlannerGrade[] {
    if (subject.lockedGrade) return [subject.lockedGrade];
    if (!useExpectedGradeFloor || !subject.gradeModified) return globalUsableGrades;
    const expectedPoints = getGradePoint(subject.grade, gpaScale);
    const subjectFloor = Math.max(floorPoints, expectedPoints);
    return globalUsableGrades.filter(g => getGradePoint(g, gpaScale) >= subjectFloor);
  }

  // Heuristic: max points achievable with remaining subjects (for early pruning)
  const maxRemainingPoints = (index: number) => {
    let maxPts = 0;
    for (let i = index; i < subjects.length; i++) {
      const grades = getSubjectGrades(subjects[i]);
      const bestGrade = grades[grades.length - 1];
      maxPts += getGradePoint(bestGrade, gpaScale) * subjects[i].credits;
    }
    return maxPts;
  };

  // Backtracking with pruning to explore valid grade combinations
  function backtrack(
    index: number,
    currentPoints: number,
    combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>
  ) {
    if (results.length >= maxResults * BACKTRACK_GENERATION_LIMIT_MULTIPLIER) {
      return;
    }

    if (index === subjects.length) {
      if (currentPoints >= requiredPoints) {
        const signature = combination
          .map(
            ({ subject, grade }) =>
              `${subject.id}:${normalizeGrade(grade, gpaScale) || grade}`,
          )
          .join("|");
        if (!seenSignatures.has(signature)) {
          seenSignatures.add(signature);
          results.push(combination);
        }
      }
      return;
    }

    const remainingCap = maxRemainingPoints(index + 1);
    const subjectGrades = getSubjectGrades(subjects[index]);

    for (const grade of subjectGrades) {
      const gradePoints = getGradePoint(grade, gpaScale) * subjects[index].credits;
      const nextPoints = currentPoints + gradePoints;

      if (nextPoints + remainingCap < requiredPoints) continue;

      backtrack(index + 1, nextPoints, [
        ...combination,
        { subject: subjects[index], grade: grade as PlannerGrade },
      ]);
    }
  }

  backtrack(0, 0, []);

  const unsorted = results.slice(0, maxResults);

  return unsorted;
}
