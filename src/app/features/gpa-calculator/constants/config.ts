/**
 * GPA Calculator Configuration Constants
 */

export const GPA_CONFIG = {
  // Total semesters in a typical degree program
  TOTAL_SEMESTERS: 8,

  // Default GPA scale (4.0 for standard, 4.2 for extended)
  DEFAULT_GPA_SCALE: 4.0,

  // Extended GPA scale used in some institutions
  EXTENDED_GPA_SCALE: 4.2,

  // Degree classification thresholds (GPA boundaries)
  DEGREE_CLASSIFICATIONS: {
    firstClass: 3.7,      // First Class Honours
    secondUpper: 3.3,    // Second Class Upper Division
    secondLower: 3.0,    // Second Class Lower Division
    general: 2.0         // General Degree
  }
} as const;
