/**
 * GPA Grade Scale Mappings
 *
 * This file contains grade-to-point conversions for different grading systems.
 * Different institutions use different grading scales (4.0, 4.2, etc.), so this
 * file provides a unified mapping system.
 */

/**
 * Standard GPA scale grade mappings (4.0 system)
 * Most universities use this scale
 */
export const STANDARD_GRADE_SCALE: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.0,
  "D": 1.0,
  "F": 0.0,
  "E": 0.0
};

/**
 * Extended GPA scale grade mappings (4.2 system)
 * Used by some institutions for finer grade differentiation
 */
export const EXTENDED_GRADE_SCALE: Record<string, number> = {
  "A+": 4.2,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.0,
  "D": 1.0,
  "F": 0.0,
  "E": 0.0
};

/**
 * Get grade point for a given grade and GPA scale
 * @param grade - Letter grade (e.g., "A", "B+", "C")
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @returns Grade point value
 */
export function getGradePoint(grade: string, gpaScale: number = 4.0): number {
  const gradeMapping = gpaScale === 4.2 ? EXTENDED_GRADE_SCALE : STANDARD_GRADE_SCALE;
  return gradeMapping[grade] || 0;
}

/**
 * Degree classification thresholds
 * These determine what class of degree a student receives based on final GPA
 */
export const DEGREE_CLASSIFICATIONS = {
  firstClass: 3.7,      // First Class Honours - exceptional performance
  secondUpper: 3.3,     // Second Class Upper Division - strong performance
  secondLower: 3.0,     // Second Class Lower Division - solid performance
  general: 2.0,         // General Degree - acceptable performance
  warning: 0.0          // Academic Warning - needs improvement
};

/**
 * Get degree classification based on GPA
 * @param gpa - Current GPA
 * @returns Degree class name
 */
export function getDegreeClassification(gpa: number): string {
  if (gpa >= DEGREE_CLASSIFICATIONS.firstClass) return "First Class";
  if (gpa >= DEGREE_CLASSIFICATIONS.secondUpper) return "Second Upper";
  if (gpa >= DEGREE_CLASSIFICATIONS.secondLower) return "Second Lower";
  if (gpa >= DEGREE_CLASSIFICATIONS.general) return "General Degree";
  return "Academic Warning";
}

// ============================================================================
// Planner and Recommendation Constants
// ============================================================================

/**
 * Grades available for planning/recommendations
 * Subset of all possible grades, typically targeting achievable grades
 */
export const PLANNER_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "E",
  "F",
] as const;
export type PlannerGrade = typeof PLANNER_GRADES[number];

/**
 * Minimum grade floor for recommendations
 * Grades below this threshold are not considered actionable (e.g., F/E require retake)
 */
export const RECOMMENDATION_GRADE_FLOOR: PlannerGrade = "C-";

/**
 * Category Keywords for Auto-Detection
 * Maps subject names to performance categories based on keyword matching
 */
export const CATEGORY_KEYWORDS = {
  programming: ["programming", "coding", "java", "python", "javascript", "typescript", "c++", "c#", "algorithm", "data structures", "software", "app"],
  math: ["math", "calculus", "statistics", "algebra", "geometry", "trigonometry", "analysis", "linear", "discrete"],
  management: ["management", "business", "finance", "accounting", "marketing", "economics", "strategy", "project"],
  database: ["database", "sql", "data", "mongodb", "postgres", "mysql", "oracle", "nosql"],
  networks: ["networks", "networking", "protocols", "tcp", "ip", "routing", "switching", "wireless"],
  systems: ["systems", "operating", "distributed", "architecture", "computer", "kernel", "parallel", "concurrent"],
  software: ["software engineering", "design patterns", "agile", "requirements", "testing", "quality", "maintenance"],
  statistics: ["statistics", "probability", "stochastic", "regression", "hypothesis", "bayesian", "inference"],
  physics: ["physics", "mechanics", "thermodynamics", "electromagnetism", "quantum", "relativity"],
  chemistry: ["chemistry", "organic", "inorganic", "analytical", "biochemistry", "physical chemistry"],
  language: ["english", "communication", "technical writing", "presentation", "rhetoric", "grammar"],
  ethics: ["ethics", "moral", "philosophy", "professional", "responsibility", "values", "dilemmas"],
} as const;

// ============================================================================
// Performance Analysis Thresholds
// ============================================================================

/**
 * Category Performance Levels
 * Used to determine subject difficulty estimation based on past performance
 */
export const STRONG_CATEGORY_THRESHOLD = 3.7;     // Average >= this = strong
export const MODERATE_CATEGORY_THRESHOLD = 3.3;   // Average >= this and < strong = moderate
// Weak = Average < MODERATE_CATEGORY_THRESHOLD

/**
 * Scoring Bonuses/Penalties for Recommendation Algorithm
 */
export const STRONG_CATEGORY_BONUS_HIGHGRADE = 2;   // Bonus for A+/A in strong categories
export const MODERATE_CATEGORY_BONUS_HIGHGRADE = 1; // Bonus for A+/A in moderate categories
export const WEAK_CATEGORY_PENALTY_HIGHGRADE = -2;  // Penalty for A+/A in weak categories
export const WEAK_CATEGORY_BONUS_MODERATE = 1;      // Bonus for A-/B+ in weak categories
export const WEAK_CATEGORY_PARTIAL_BONUS_B = 0.5;   // Partial bonus for B in weak categories

// ============================================================================
// Difficulty Metrics
// ============================================================================

/**
 * Thresholds for classifying plan difficulty
 * Used in plan generation to warn users about feasibility
 */
export const DIFFICULTY_VERY_HARD_MARGIN = 0.1;    // requiredSgpa > gpaScale - this = very hard
export const DIFFICULTY_CHALLENGING_MARGIN = 0.3;  // requiredSgpa > gpaScale - this = challenging
// ACHIEVABLE = requiredSgpa <= gpaScale - challenging margin

// ============================================================================
// Simulation Constants
// ============================================================================

/**
 * Monte Carlo Simulation Settings
 * Used for predicting degree class probability
 */
export const MONTE_CARLO_SIMULATIONS = 1000;        // Default number of simulation runs
export const SIMULATION_GPA_MIN = 2.5;              // Minimum GPA in simulations
export const SIMULATION_GPA_MAX_4_0 = 4.0;          // Maximum in 4.0 scale
export const SIMULATION_GPA_MAX_4_2 = 4.2;          // Maximum in 4.2 scale

// ============================================================================
// Recommendation Algorithm Constraints
// ============================================================================

/**
 * Backtracking and Result Limiting
 * Prevents long computation times with many subjects
 */
export const MAX_RECOMMENDATION_RESULTS = 30;         // Maximum top results to return
export const BACKTRACK_GENERATION_LIMIT_MULTIPLIER = 5; // Generate top 30 * 5 = 150, then sort/trim to 30
export const MAX_RECOMMENDATION_STATE_EXPANSIONS = 25000;
