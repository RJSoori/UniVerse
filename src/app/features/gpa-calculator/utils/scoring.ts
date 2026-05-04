/**
 * GPA Score Calculation Utilities
 * 
 * Scoring system for recommendation combinations. Evaluates how realistic
 * and well-suited each grade combination is based on past performance,
 * preferring efficient plans that use easier grades when they're sufficient.
 */

import { PlannerSubject } from "../types";
import { PlannerGrade } from "../constants/gradeScales";
import {
  STRONG_CATEGORY_BONUS_HIGHGRADE,
  MODERATE_CATEGORY_BONUS_HIGHGRADE,
  WEAK_CATEGORY_PENALTY_HIGHGRADE,
  WEAK_CATEGORY_BONUS_MODERATE,
  WEAK_CATEGORY_PARTIAL_BONUS_B,
} from "../constants/gradeScales";
import { getCategoryStrength, CategoryPerformance, CategoryProbabilityModel } from "./performance";
import { getGradePoint } from "./gpaPrediction";
import { getGradesPreferringEasiest } from "./combinations";

/**
 * Calculate expected feasibility score using probability distributions
 * Higher scores indicate more realistic grade assignments based on historical data
 * @param grade - The grade being assigned
 * @param probabilityModel - Probability distribution for the category
 * @returns Probability-based feasibility score (0-1, higher = more likely)
 */
function calculateProbabilityScore(grade: PlannerGrade, probabilityModel: CategoryProbabilityModel): number {
  const probability = probabilityModel.distribution[grade] || 0;
  
  // Boost score for grades with higher historical probability
  // Also consider confidence in the model
  return probability * probabilityModel.confidence;
}

/**
 * Check if a grade is the minimum (easiest) one needed for a subject
 * to achieve the required SGPA given the other subjects' grades.
 * Returns true if a lower grade would still allow reaching the target.
 * @param currentGrade - Grade assigned to this subject
 * @param subject - The subject info
 * @param otherPointsContribution - Points from all other subjects
 * @param totalOtherCredits - Credits from all other subjects
 * @param targetPoints - Total points needed to hit required SGPA
 * @param gpaScale - GPA scale for calculations
 * @returns true if this grade can be downgraded while still meeting target
 */
function canGradeBeDowngraded(
  currentGrade: PlannerGrade,
  subject: PlannerSubject,
  otherPointsContribution: number,
  totalOtherCredits: number,
  targetPoints: number,
  gpaScale: number
): boolean {
  const currentPoints = getGradePoint(currentGrade, gpaScale) * subject.credits;
  
  // Try each grade easier than current to see if it still achieves target
  const preferredGrades = getGradesPreferringEasiest(gpaScale);
  const currentIndex = preferredGrades.indexOf(currentGrade);
  
  if (currentIndex <= 0) return false; // Already the easiest grade
  
  for (let i = 0; i < currentIndex; i++) {
    const easierGrade = preferredGrades[i];
    const easierPoints = getGradePoint(easierGrade, gpaScale) * subject.credits;
    if (otherPointsContribution + easierPoints >= targetPoints) {
      return true; // This easier grade is sufficient
    }
  }
  
  return false; // No easier grade works
}

/**
 * Score a grade combination based on efficiency, realism, and balance
 * Higher scores indicate more realistic and recommendable plans.
 * 
 * NEW: Uses probability-based realism scoring instead of categorical thresholds
 * 
 * Scoring components:
 * - Efficiency (+2 per subject where grade is the easiest sufficient one)
 * - Probability-based Realism (expected feasibility using historical distributions)
 * - Balance (-0.5 per subject where A+ is used unnecessarily)
 * 
 * @param combination - Array of subject-grade pairs
 * @param performance - Past performance stats by category (legacy support)
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @param requiredSgpa - Target SGPA to reach (for efficiency calculation)
 * @param subjects - Original subject list (for efficiency calculation)
 * @param probabilityModels - NEW: Probability models for realistic scoring
 * @returns Score value (higher = better recommendation)
 */
export function scoreCombination(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number,
  requiredSgpa: number = 0,
  subjects: PlannerSubject[] = [],
  probabilityModels?: Record<string, CategoryProbabilityModel>
): number {
  let score = 0;
  const highGrades = new Set(["A+", "A"]);
  let aplusCount = 0;

  // Calculate total credits needed for reference
  const totalCredits = combination.reduce((sum, entry) => sum + entry.subject.credits, 0);
  const targetPoints = requiredSgpa * totalCredits;
  const totalComboPoints = combination.reduce(
    (sum, entry) => sum + getGradePoint(entry.grade, gpaScale) * entry.subject.credits, 0
  );

  combination.forEach(({ subject, grade }, index) => {
    const gradePoints = getGradePoint(grade, gpaScale);
    const creditWeight = subject.credits / (totalCredits / combination.length); // normalised around 1.0

    // EFFICIENCY SCORING (unchanged - still valuable)
    if (requiredSgpa > 0 && subjects.length > 0) {
      const thisPoints = getGradePoint(grade, gpaScale) * subject.credits;
      const otherPointsContribution = totalComboPoints - thisPoints;
      const otherCredits = totalCredits - subject.credits;

      if (!canGradeBeDowngraded(grade, subject, otherPointsContribution, otherCredits, targetPoints, gpaScale)) {
        score += 2 * creditWeight; // This grade is the minimum needed - high efficiency!
      } else {
        score -= 1 * creditWeight; // Grade is wastefully high - penalize
      }
    }

    // PROBABILITY-BASED REALISM SCORING (NEW - replaces categorical approach)
    if (probabilityModels) {
      const model = probabilityModels[subject.category];
      if (model && model.totalGrades > 0) {
        const probabilityScore = calculateProbabilityScore(grade, model);
        score += probabilityScore * 10 * creditWeight; // Scale probability score to be comparable with other components
        
        // Additional bonus for grades that align with historical patterns
        if (probabilityScore > 0.3) {
          score += 1 * creditWeight; // Bonus for realistic grade assignments
        }
      } else {
        // Fallback to legacy categorical scoring when no probability model available
        const average = performance[subject.category]?.average ?? 0;
        const strength = getCategoryStrength(average);
        
        if (strength === "strong" && highGrades.has(grade)) {
          score += STRONG_CATEGORY_BONUS_HIGHGRADE * creditWeight;
        }
        if (strength === "moderate" && highGrades.has(grade)) {
          score += MODERATE_CATEGORY_BONUS_HIGHGRADE * creditWeight;
        }
        if (strength === "weak" && highGrades.has(grade)) {
          score += WEAK_CATEGORY_PENALTY_HIGHGRADE * creditWeight;
        }
        if (strength === "weak" && grade === "A-") {
          score += WEAK_CATEGORY_BONUS_MODERATE * creditWeight;
        }
        if (strength === "weak" && grade === "B+") {
          score += WEAK_CATEGORY_BONUS_MODERATE * creditWeight;
        }
        if (strength === "weak" && grade === "B") {
          score += WEAK_CATEGORY_PARTIAL_BONUS_B * creditWeight;
        }
      }
    } else {
      // Legacy categorical scoring when no probability models provided
      const average = performance[subject.category]?.average ?? 0;
      const strength = getCategoryStrength(average);

      if (strength === "strong" && highGrades.has(grade)) {
        score += STRONG_CATEGORY_BONUS_HIGHGRADE * creditWeight;
      }
      if (strength === "moderate" && highGrades.has(grade)) {
        score += MODERATE_CATEGORY_BONUS_HIGHGRADE * creditWeight;
      }
      if (strength === "weak" && highGrades.has(grade)) {
        score += WEAK_CATEGORY_PENALTY_HIGHGRADE * creditWeight;
      }
      if (strength === "weak" && grade === "A-") {
        score += WEAK_CATEGORY_BONUS_MODERATE * creditWeight;
      }
      if (strength === "weak" && grade === "B+") {
        score += WEAK_CATEGORY_BONUS_MODERATE * creditWeight;
      }
      if (strength === "weak" && grade === "B") {
        score += WEAK_CATEGORY_PARTIAL_BONUS_B * creditWeight;
      }
    }

    // BALANCE SCORING (unchanged)
    if (grade === "A+") {
      aplusCount++;
    }
  });

  // Penalize excessive A+ usage
  const excessAplusCount = Math.max(0, aplusCount - Math.ceil(combination.length / 3));
  score -= excessAplusCount * 0.5;

  return score;
}

