/**
 * GPA Grade Scale Mappings
 *
 * This file contains grade-to-point conversions for different grading systems.
 * Different institutions use different grading scales (4.0, 4.2, etc.), so this
 * file provides a unified mapping system.
 */

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
export const MAX_RECOMMENDATION_RESULTS = 30;
export const BACKTRACK_GENERATION_LIMIT_MULTIPLIER = 5;
