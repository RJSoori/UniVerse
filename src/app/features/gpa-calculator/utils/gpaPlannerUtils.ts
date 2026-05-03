import { PlannerSubject } from "../types";
import { getGradePoint } from "./gpaPrediction";
import {
  PLANNER_GRADES,
  PlannerGrade,
  STRONG_CATEGORY_THRESHOLD,
  MODERATE_CATEGORY_THRESHOLD,
  DIFFICULTY_VERY_HARD_MARGIN,
  DIFFICULTY_CHALLENGING_MARGIN,
} from "../constants/gradeScales";
import {
  analyzePastPerformance,
  assignCategory,
  extractKeywords,
  getCategoryStrength,
  CategoryPerformance,
  buildProbabilityModels,
  CategoryProbabilityModel,
} from "./performance";
import { scoreCombination, evaluateCombination, rankCombinations, EvaluatedCombination } from "./scoring";
import { generateCombinations, calculateSgpaForSubjects, getGradesPreferringEasiest } from "./combinations";
import { bestFirstSearch } from "./bestFirstSearch";
import { normalizeGrade, roundGpa } from "../../../shared/validation";

// Re-export for backward compatibility
export { PLANNER_GRADES };
export type { PlannerGrade };
export { analyzePastPerformance, assignCategory, extractKeywords, getCategoryStrength };
export type { CategoryPerformance };

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
  return combination.map(({ subject, grade }) => ({
    subject,
    grade: (normalizeGrade(grade, gpaScale) || grade) as PlannerGrade,
  }));
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

function removeDominatedPlans(plans: CombinationResult[]): CombinationResult[] {
  return plans.filter((plan, index) => {
    return !plans.some((candidate, candidateIndex) => {
      if (index === candidateIndex) return false;
      const sameOrBetterSgpa = candidate.sgpa >= plan.sgpa;
      const easierDifficulty =
        ["ACHIEVABLE", "CHALLENGING", "VERY HARD", "IMPOSSIBLE"].indexOf(
          candidate.difficulty,
        ) <=
        ["ACHIEVABLE", "CHALLENGING", "VERY HARD", "IMPOSSIBLE"].indexOf(
          plan.difficulty,
        );
      const sameOrBetterScore = candidate.score >= plan.score;
      return sameOrBetterSgpa && easierDifficulty && sameOrBetterScore;
    });
  });
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

function classifyRecommendationStrategy(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number
): string {
  if (combination.length === 0) return "Minimum viable plan";

  // Sort subjects by credits descending
  const sortedByCredits = [...combination].sort((a, b) => b.subject.credits - a.subject.credits);
  const highCreditSubjects = sortedByCredits.slice(0, Math.ceil(combination.length / 2));

  // Check if high-credit subjects have high grades
  const highGrades = ["A+", "A", "A-"];
  const highCreditHighGrades = highCreditSubjects.filter(entry => highGrades.includes(entry.grade)).length;
  if (highCreditHighGrades === highCreditSubjects.length) {
    return "Prioritise high-value subjects";
  }

  // Check if grades are within one tier (all A/B or all B/C etc.)
  const gradeTiers = combination.map(entry => {
    const points = getGradePoint(entry.grade, gpaScale);
    if (points >= 3.7) return "A";
    if (points >= 3.0) return "B";
    if (points >= 2.0) return "C";
    return "D";
  });
  const uniqueTiers = new Set(gradeTiers);
  if (uniqueTiers.size === 1) {
    return "Balanced effort";
  }

  // Check if strong categories carry most points
  const strongCategories = Object.keys(performance).filter(cat => performance[cat].average >= 3.3);
  const strongPoints = combination
    .filter(entry => strongCategories.includes(entry.subject.category))
    .reduce((sum, entry) => sum + getGradePoint(entry.grade, gpaScale) * entry.subject.credits, 0);
  const totalPoints = combination.reduce((sum, entry) => sum + getGradePoint(entry.grade, gpaScale) * entry.subject.credits, 0);
  if (strongPoints / totalPoints > 0.6) {
    return "Play to your strengths";
  }

  return "Minimum viable plan";
}

export function buildStrategyExplanation(
  _combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  strategy: "Safe" | "Balanced" | "Aggressive",
  pressure: "Low" | "Moderate" | "High",
  focusAreas: string[],
  flexibleSubjects: string[]
): string {
  const focusText = focusAreas.length > 0 ? ` in ${focusAreas.join(" and ")}` : "";
  const flexibleText = flexibleSubjects.length > 0 ? ` You have flexibility in ${flexibleSubjects.slice(0, 2).join(" and ")}.` : "";
  let strategicReasoning = "";
  if (strategy === "Safe") {
    strategicReasoning = "This aligns with your historical performance—lower risk of surprises.";
  } else if (strategy === "Balanced") {
    strategicReasoning = "Balances reliability with growth—requires focused effort in key areas.";
  } else {
    strategicReasoning = "Demands significant improvement, but achievable with dedicated effort.";
  }
  return `**${strategy} Strategy** | This plan focuses on securing strong grades${focusText} while maintaining solid performance elsewhere. Pressure: ${pressure}. ${strategicReasoning}${flexibleText}`;
}

export function generateExplanation(
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  performance: Record<string, CategoryPerformance>,
  gpaScale: number,
  probabilityModels?: Record<string, CategoryProbabilityModel>
): string {
  if (combination.length === 0) {
    return "No subjects to plan.";
  }

  const gradeExplanations: string[] = [];
  let hasHighRiskGrades = false;
  const gradesPreferredOrder = getGradesPreferringEasiest(gpaScale);

  // Analyze each subject-grade pairing
  for (const { subject, grade } of combination) {
    const gradePoint = getGradePoint(grade, gpaScale);
    const categoryPerf = performance[subject.category];
    const historicalAvg = categoryPerf?.average ?? 0;
    const probabilityModel = probabilityModels?.[subject.category];
    
    // Check if this grade can be downgraded
    let gradeExplanation = `${grade} in ${subject.name}`;
    
    // Find easier grades with same point value (grade equivalence)
    const easierEquivalent = gradesPreferredOrder.findIndex(g => g === grade) > 0
      ? gradesPreferredOrder.find((g, idx) => 
          idx < gradesPreferredOrder.indexOf(grade) && 
          getGradePoint(g, gpaScale) === gradePoint
        )
      : null;
    
    if (easierEquivalent) {
      gradeExplanation += ` (${easierEquivalent} is sufficient—both earn ${gradePoint.toFixed(1)} points)`;
    }

    // Assess feasibility using probability model (NEW) or historical average (fallback)
    if (probabilityModel && probabilityModel.totalGrades > 0) {
      const gradeProbability = probabilityModel.distribution[grade] || 0;
      const confidence = probabilityModel.confidence;
      
      if (gradeProbability > 0.3 && confidence > 0.7) {
        gradeExplanation += `. High confidence—${(gradeProbability * 100).toFixed(0)}% historical probability in ${subject.category}`;
      } else if (gradeProbability > 0.1) {
        gradeExplanation += `. Moderate confidence—${(gradeProbability * 100).toFixed(0)}% historical probability`;
      } else if (gradeProbability > 0) {
        gradeExplanation += `. Low confidence—rare grade (${(gradeProbability * 100).toFixed(1)}% historical probability)`;
        hasHighRiskGrades = true;
      } else {
        gradeExplanation += `. This grade is less common historically in ${subject.category} and should be treated cautiously.`;
        hasHighRiskGrades = true;
      }
    } else {
      // Fallback to historical average assessment
      if (historicalAvg > 0) {
        const performanceGap = gradePoint - historicalAvg;
        if (performanceGap > 0.3) {
          gradeExplanation += `. Challenging—requires improvement from your historical ${historicalAvg.toFixed(1)} to ${gradePoint.toFixed(1)}`;
          hasHighRiskGrades = true;
        } else if (performanceGap > 0) {
          gradeExplanation += `. Moderate difficulty—slightly above your historical average of ${historicalAvg.toFixed(1)}`;
        } else {
          gradeExplanation += `. High confidence—aligns with your historical average of ${historicalAvg.toFixed(1)}`;
        }
      } else {
        gradeExplanation += `. Historical records are sparse for ${subject.category}; consider this grade with caution.`;
      }
    }

    gradeExplanations.push(gradeExplanation);
  }

  // Build overall assessment
  const totalPoints = combination.reduce(
    (sum, { subject, grade }) => sum + getGradePoint(grade, gpaScale) * subject.credits,
    0
  );
  const totalCredits = combination.reduce((sum, { subject }) => sum + subject.credits, 0);
  const achievedSgpa = totalPoints / totalCredits;

  let overallAssessment = "This plan ";
  
  // Check if plan heavily uses A+ or A
  const aOrAboveCount = combination.filter(({ grade }) => grade === "A" || grade === "A+").length;
  if (aOrAboveCount === combination.length) {
    overallAssessment += "achieves maximum SGPA with straight As or A+s. ";
  } else if (aOrAboveCount >= combination.length - 1) {
    overallAssessment += "achieves very high SGPA with mostly A/A+ grades. ";
  } else {
    overallAssessment += `achieves an SGPA of ${achievedSgpa.toFixed(2)}. `;
  }

  if (hasHighRiskGrades) {
    overallAssessment += "Note: Multiple grades exceed your current performance levels—choose this plan only if you're confident in significant improvement.";
  } else {
    overallAssessment += "All grades are realistic based on your past performance.";
  }

  return gradeExplanations.join(" | ") + " → " + overallAssessment;
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
  
  const rawCombinations = generateCombinations(subjects, requiredSgpa, gpaScale);
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

  return removeDominatedPlans(scored)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Math.abs(a.points - requiredPoints) - Math.abs(b.points - requiredPoints);
    })
    .slice(0, 3);
}

/**
 * Phase 4 Architecture: Intelligent Recommendation Engine
 * 
 * Pipeline:
 * 1. Analyze: Build probability models from historical semester data
 * 2. Search: Use best-first search to explore top combinations efficiently
 * 3. Evaluate: Calculate multiple dimensions (probability, efficiency, risk)
 * 4. Rank: Multi-objective ranking (Probability > Efficiency > Risk)
 * 5. Explain: Generate detailed explanations with confidence percentages
 * 
 * Benefits over V1:
 * - Probability-driven scoring reflects actual likelihood of achieving grades
 * - Best-first search explores promising branches without exhaustive enumeration
 * - Multi-dimensional ranking considers efficiency and risk in addition to feasibility
 * - Confidence levels show quality of historical data backing each recommendation
 * 
 * @param subjects - List of subjects to assign grades to
 * @param requiredSgpa - Target SGPA to reach
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @param performance - Historical performance stats by category
 * @param semesters - Historical semester data for probability model building
 * @returns Top 3 recommendations with detailed metrics and explanations
 */
export function buildRecommendationsV2(
  subjects: PlannerSubject[],
  requiredSgpa: number,
  gpaScale: number,
  performance: Record<string, CategoryPerformance>,
  semesters?: any[]
): CombinationResult[] {
  if (subjects.length === 0) return [];

  const probabilityModels = semesters ? buildProbabilityModels(semesters, gpaScale) : {};
  const searchResults = bestFirstSearch(subjects, requiredSgpa, gpaScale, probabilityModels);

  if (searchResults.length === 0) {
    return buildRecommendations(subjects, requiredSgpa, gpaScale, performance, semesters);
  }

  const evaluated = searchResults.map((combination) =>
    evaluateCombination(combination, probabilityModels, gpaScale, requiredSgpa)
  );

  let ranked = rankCombinations(evaluated);

  // Add diversity filter: return up to 3 meaningfully different plans
  const diversePlans: EvaluatedCombination[] = [];
  for (const plan of ranked) {
    if (diversePlans.every(p => combinationSimilarity(p.combination, plan.combination) < 0.7)) {
      diversePlans.push(plan);
    }
  }

  // Return top 3 diverse plans (or fewer if not enough diversity)
  return diversePlans
    .slice(0, 3)
    .map((evaluated) => {
      const { combination, sgpa, points } = evaluated;
      const displayCombination = normalizePlanCombination(combination, gpaScale);

      const strategy = classifyRecommendationStrategy(displayCombination, performance, gpaScale);
      const pressure = calculatePlanPressure(displayCombination, performance, gpaScale);
      const focusAreas = extractFocusAreas(displayCombination, performance, gpaScale);
      const flexibleSubjects = findFlexibleSubjects(displayCombination, requiredSgpa, subjects, gpaScale);

      return {
        combination: displayCombination,
        sgpa: roundGpa(sgpa),
        points,
        score: evaluated.finalScore,
        explanation: buildStrategyExplanation(displayCombination, strategy, pressure, focusAreas, flexibleSubjects),
        difficulty: getPlanDifficulty(requiredSgpa, gpaScale),
        strategy,
        pressure,
        focusAreas,
        flexibleSubjects,
        strengthScore: evaluated.probabilityScore,
      };
    });
}

/**
 * Legacy explanation generator (V1 compatibility)
 * V2 uses buildStrategyExplanation instead
 */
function buildExplanationV2(
  _combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  _performance: Record<string, CategoryPerformance>,
  _gpaScale: number,
  _probabilityModels: Record<string, CategoryProbabilityModel>,
  _evaluated: EvaluatedCombination
): string {
  return "";
}
