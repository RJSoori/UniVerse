/**
 * GPA Combination Generation Utilities
 * 
 * Uses backtracking algorithm to find grade combinations that achieve
 * a required SGPA. Optimized with early termination and sorting.
 */

import { PlannerSubject } from "../components/gpa-calculator/types";
import { PlannerGrade, MAX_RECOMMENDATION_RESULTS, BACKTRACK_GENERATION_LIMIT_MULTIPLIER, RECOMMENDATION_GRADE_FLOOR } from "../constants/gradeScales";
import { getGradePoint } from "../components/gpa-calculator/utils/gpaPrediction";
import { normalizeGrade, roundGpa } from "./validation";

/**
 * Get grades preferring the easiest ones that achieve each point value.
 * This detects grade equivalence (e.g., A and A+ both = 4.0 in 4.0 scale)
 * and prefers the easier grade.
 * 
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @returns Sorted array of grades from easiest to hardest, with equivalent grades deduplicated
 */
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

/**
 * Calculate SGPA for given subjects with their assigned grades
 * @param subjects - Array of subjects with grades assigned
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @returns Calculated SGPA
 */
export function calculateSgpaForSubjects(subjects: PlannerSubject[], gpaScale: number): number {
  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const totalPoints = subjects.reduce(
    (sum, subject) =>
      sum +
      getGradePoint(normalizeGrade(subject.grade, gpaScale) || subject.grade, gpaScale) *
        subject.credits,
    0
  );
  return totalCredits > 0 ? roundGpa(totalPoints / totalCredits) : 0;
}

/**
 * Generate all valid grade combinations that meet required SGPA
 * Uses backtracking to explore the space efficiently
 * Stops generating after reaching threshold to prevent long runtimes
 * 
 * Preference-based iteration: Grades are tried in order from easiest to hardest,
 * naturally producing practical recommendations that prefer achievable grades.
 * 
 * @param subjects - Subjects to assign grades
 * @param requiredSgpa - Target SGPA to achieve
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @param maxResults - Maximum top results to return (default 30)
 * @returns Top combinations sorted by proximity to required SGPA
 */
export function generateCombinations(
  subjects: PlannerSubject[],
  requiredSgpa: number,
  gpaScale: number,
  maxResults: number = MAX_RECOMMENDATION_RESULTS
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
  const usableGrades = gradesInPreferenceOrder.filter(
    g => getGradePoint(g, gpaScale) >= floorPoints
  );

  // Heuristic: max points achievable with remaining subjects (for early pruning)
  const maxRemainingPoints = (index: number) => {
    const remainingCredits = subjects.slice(index).reduce((sum, subject) => sum + subject.credits, 0);
    return remainingCredits * maxGradePoint;
  };

  // Backtracking with pruning to explore valid grade combinations
  function backtrack(
    index: number,
    currentPoints: number,
    combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>
  ) {
    // Stop if we've generated enough valid combinations (prevents timeout on large subject lists)
    if (results.length >= maxResults * BACKTRACK_GENERATION_LIMIT_MULTIPLIER) {
      return;
    }

    // Base case: all subjects have been assigned grades
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

    // Early termination: even with maximum grades for all remaining subjects, can't reach target
    const remainingCap = maxRemainingPoints(index + 1);

    // If grade is locked, use it directly
    if (subjects[index].lockedGrade) {
      const gradePoints = getGradePoint(subjects[index].lockedGrade, gpaScale) * subjects[index].credits;
      const nextPoints = currentPoints + gradePoints;
      if (nextPoints + remainingCap < requiredPoints) return;
      backtrack(index + 1, nextPoints, [
        ...combination,
        { subject: subjects[index], grade: subjects[index].lockedGrade },
      ]);
      return;
    }

    // Try grades in preference order (easiest first)
    for (const grade of usableGrades) {
      const gradePoints = getGradePoint(grade, gpaScale) * subjects[index].credits;
      const nextPoints = currentPoints + gradePoints;

      // Prune: branch cannot achieve required SGPA regardless of future choices
      if (nextPoints + remainingCap < requiredPoints) continue;

      backtrack(index + 1, nextPoints, [
        ...combination,
        { subject: subjects[index], grade: grade as PlannerGrade },
      ]);
    }
  }

  backtrack(0, 0, []);

  // Return first valid combinations found (unsorted - ranking handled by scorer)
  const unsorted = results.slice(0, maxResults);

  return unsorted;
}
