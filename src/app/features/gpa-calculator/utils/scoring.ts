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
import { getGradePoint, getGradePointsMap } from "./gpaPrediction";
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
 * Calculate expected feasibility for a combination using probability model
 * Uses product of individual grade probabilities as overall feasibility
 * @param combination - Array of subject-grade pairs
 * @param probabilityModels - Probability models per category
 * @returns Expected feasibility score (0-1, higher = more realistic combination)
 */
export function calculateExpectedFeasibility(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  probabilityModels: Record<string, CategoryProbabilityModel>
): number {
  if (combination.length === 0) return 0;
  
  let totalProbability = 1.0;
  let totalConfidence = 0;
  
  combination.forEach(({ subject, grade }) => {
    const model = probabilityModels[subject.category];
    if (model && model.totalGrades > 0) {
      const gradeProbability = model.distribution[grade] || 0.01; // Small probability for unseen grades
      const confidence = model.confidence;
      
      // Use geometric mean of probabilities, weighted by confidence
      totalProbability *= Math.pow(gradeProbability, confidence);
      totalConfidence += confidence;
    } else {
      // No historical data - use neutral probability
      totalProbability *= 0.1; // Conservative estimate
      totalConfidence += 0.5;
    }
  });
  
  // Normalize by number of subjects and average confidence
  const avgConfidence = totalConfidence / combination.length;
  return Math.pow(totalProbability, 1 / combination.length) * avgConfidence;
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

/**
 * Multi-dimensional evaluation of a combination
 * Calculates three independent metrics: probability score, effort, and risk
 * These are later combined for final ranking
 */
export interface EvaluatedCombination {
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>;
  sgpa: number;
  points: number;
  probabilityScore: number; // Expected feasibility (0-1, higher = more likely)
  totalPoints: number; // Raw point contribution
  creditImpactScore: number; // Weighted by credit hours (higher = more efficient)
  finalScore: number; // Combined score for ranking
  riskLevel: "LOW" | "MEDIUM" | "HIGH"; // Derived from probability score
  confidence: number; // Confidence percentage (0-100)
}

/**
 * Evaluate a single combination across multiple dimensions
 * 
 * Scoring dimensions:
 * 1. Probability Score: Product of individual grade probabilities → feasibility
 * 2. Total Points: Raw points contributed → how far towards target
 * 3. Credit Impact: Points per credit ratio → efficiency of grade distribution
 * 4. Risk Level: Inverse of probability → difficulty assessment
 * 5. Confidence: Percentage of subjects with good historical data
 * 
 * @param combination - Array of subject-grade assignments
 * @param probabilityModels - Probability distributions from historical data
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @param requiredSgpa - Target SGPA (for context)
 * @returns Evaluated combination with multiple metrics
 */
export function evaluateCombination(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  probabilityModels: Record<string, CategoryProbabilityModel>,
  gpaScale: number,
  requiredSgpa: number = 0
): EvaluatedCombination {
  const totalCredits = combination.reduce((sum, { subject }) => sum + subject.credits, 0);
  const totalPoints = combination.reduce(
    (sum, { subject, grade }) => sum + getGradePoint(grade, gpaScale) * subject.credits,
    0
  );
  const sgpa = totalPoints / totalCredits;

  // Calculate probability score: product of individual probabilities
  let probabilityScore = 1.0;
  let confidenceCount = 0;

  combination.forEach(({ subject, grade }) => {
    const model = probabilityModels[subject.category];
    if (model && model.totalGrades > 0) {
      const gradeProbability = model.distribution[grade] || 0.01;
      probabilityScore *= Math.pow(gradeProbability, 1 / combination.length);
      confidenceCount++;
    } else {
      probabilityScore *= 0.1; // Conservative estimate for unknown categories
    }
  });

  // Normalize probability score
  probabilityScore = Math.min(1.0, probabilityScore);

  // Calculate credit impact score: how efficiently credits are used
  const avgPointsPerCredit = totalPoints / totalCredits;
  const maxPossiblePointsPerCredit = gpaScale;
  let creditImpactScore = (avgPointsPerCredit / maxPossiblePointsPerCredit) * 100;

  // Penalize unnecessary A+ when equivalent to A
  let aplusPenalty = 0;
  combination.forEach(({ grade }) => {
    if (grade === "A+" && getGradePoint("A+", gpaScale) === getGradePoint("A", gpaScale)) {
      aplusPenalty += 0.5;
    }
  });
  creditImpactScore = Math.max(0, creditImpactScore - aplusPenalty);

  // Determine risk level based on probability score
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "HIGH";
  if (probabilityScore > 0.5) {
    riskLevel = "LOW";
  } else if (probabilityScore > 0.2) {
    riskLevel = "MEDIUM";
  }

  // Calculate confidence percentage
  const confidence = (confidenceCount / combination.length) * 100;

  // Final score: weighted combination of metrics
  // Primary: Probability (70%), Secondary: Credit Impact (20%), Tertiary: Risk balance (10%)
  const finalScore = probabilityScore * 0.7 + (creditImpactScore / 100) * 0.2 + (1 - (riskLevel === "HIGH" ? 1 : riskLevel === "MEDIUM" ? 0.5 : 0)) * 0.1;

  return {
    combination,
    sgpa,
    points: totalPoints,
    probabilityScore,
    totalPoints,
    creditImpactScore,
    finalScore,
    riskLevel,
    confidence,
  };
}

/**
 * Rank evaluated combinations using multi-objective optimization
 * 
 * Primary sort: Probability score (highest = best)
 * Secondary sort: Total points (higher = gets us closer to target)
 * Tertiary sort: Credit impact (higher = more efficient)
 * 
 * This Pareto-style ranking ensures diverse, high-quality recommendations
 * 
 * @param evaluated - Array of evaluated combinations
 * @returns Sorted array with best combinations first
 */
export function rankCombinations(evaluated: EvaluatedCombination[]): EvaluatedCombination[] {
  return [...evaluated].sort((a, b) => {
    // Primary: Probability score (higher is better)
    if (Math.abs(a.probabilityScore - b.probabilityScore) > 0.01) {
      return b.probabilityScore - a.probabilityScore;
    }

    // Secondary: Total points (higher is better)
    if (a.totalPoints !== b.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    // Tertiary: Credit impact (higher is better)
    if (Math.abs(a.creditImpactScore - b.creditImpactScore) > 0.1) {
      return b.creditImpactScore - a.creditImpactScore;
    }

    // Quaternary: Risk level (lower is better)
    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
}

