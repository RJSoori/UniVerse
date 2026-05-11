/**
 * GPA Performance Analysis Utilities
 * 
 * Analyzes student's past performance by category to provide personalized
 * recommendations based on actual strengths and weaknesses.
 */

import { Semester } from "../types";
import { getGradePoint } from "./gpaPrediction";
import {
  CATEGORY_KEYWORDS,
  STRONG_CATEGORY_THRESHOLD,
  MODERATE_CATEGORY_THRESHOLD,
} from "../constants/gradeScales";

export interface CategoryPerformance {
  average: number;
  credits: number;
}

interface GradeProbabilityDistribution {
  "A+": number;
  "A": number;
  "A-": number;
  "B+": number;
  "B": number;
  "B-": number;
  "C+": number;
  "C": number;
  "C-": number;
  "D+": number;
  "D": number;
  "F": number;
  "E": number;
}

export interface CategoryProbabilityModel {
  distribution: GradeProbabilityDistribution;
  totalGrades: number;
  average: number;
  credits: number;
  confidence: number; // Based on sample size and recency
}

/**
 * Extract keywords from subject name
 * Used to categorize subjects by domain (programming, math, etc.)
 * @param name - Subject name
 * @returns Array of lowercase keywords
 */
function extractKeywords(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Automatically detect category for a subject based on keywords
 * Looks for programming, math, management, database keywords
 * @param subjectName - Subject name
 * @returns Category name (programming, math, management, database, or other)
 */
export function assignCategory(subjectName: string): string {
  const keywords = extractKeywords(subjectName);
  for (const [category, matches] of Object.entries(CATEGORY_KEYWORDS)) {
    if (matches.some((match) => keywords.some((keyword) => keyword.includes(match) || match.includes(keyword)))) {
      return category;
    }
  }
  return "other";
}

/**
 * Analyze student's past performance by category
 * Calculates average GPA and total credits per category from semester history
 * @param semesters - Array of completed semesters
 * @param gpaScale - GPA scale (4.0 or 4.2) to use for calculations
 * @returns Performance stats per category (average GPA and credits)
 */
export function analyzePastPerformance(
  semesters: Semester[],
  gpaScale: number
): Record<string, CategoryPerformance> {
  const categories: Record<string, CategoryPerformance> = {
    programming: { average: 0, credits: 0 },
    math: { average: 0, credits: 0 },
    management: { average: 0, credits: 0 },
    database: { average: 0, credits: 0 },
    networks: { average: 0, credits: 0 },
    systems: { average: 0, credits: 0 },
    software: { average: 0, credits: 0 },
    statistics: { average: 0, credits: 0 },
    physics: { average: 0, credits: 0 },
    chemistry: { average: 0, credits: 0 },
    language: { average: 0, credits: 0 },
    ethics: { average: 0, credits: 0 },
    other: { average: 0, credits: 0 },
  };

  const totals: Record<string, { points: number; credits: number }> = {
    programming: { points: 0, credits: 0 },
    math: { points: 0, credits: 0 },
    management: { points: 0, credits: 0 },
    database: { points: 0, credits: 0 },
    networks: { points: 0, credits: 0 },
    systems: { points: 0, credits: 0 },
    software: { points: 0, credits: 0 },
    statistics: { points: 0, credits: 0 },
    physics: { points: 0, credits: 0 },
    chemistry: { points: 0, credits: 0 },
    language: { points: 0, credits: 0 },
    ethics: { points: 0, credits: 0 },
    other: { points: 0, credits: 0 },
  };

  // Accumulate weighted points and credits per category from all semesters
  const totalSemesters = semesters.length;
  semesters.forEach((semester, semIndex) => {
    const recencyWeight = Math.pow(1.3, semIndex); // later semesters weighted 30% more each time
    semester.subjects.forEach((subject) => {
      if (subject.isGpa === false) return;
      const category = assignCategory(subject.name);
      const points = getGradePoint(subject.grade, gpaScale) * subject.credits * recencyWeight;
      const weightedCredits = subject.credits * recencyWeight;
      totals[category].points += points;
      totals[category].credits += weightedCredits;
    });
  });

  // Compute mean grade average per category
  Object.entries(totals).forEach(([category, stats]) => {
    categories[category].credits = stats.credits;
    categories[category].average = stats.credits > 0 ? stats.points / stats.credits : 0;
  });

  return categories;
}

/**
 * Build probability distribution models for each category based on historical grades
 * Uses recency weighting to give more importance to recent semesters
 * @param semesters - Array of completed semesters
 * @param gpaScale - GPA scale (4.0 or 4.2) to use for calculations
 * @returns Probability models per category with grade distributions and confidence scores
 */
export function buildProbabilityModels(
  semesters: Semester[],
  gpaScale: number
): Record<string, CategoryProbabilityModel> {
  const categories: Record<string, {
    gradeCounts: Record<string, number>;
    totalGrades: number;
    totalPoints: number;
    totalCredits: number;
    weightedGrades: Array<{ grade: string; weight: number; semesterIndex: number }>;
  }> = {
    programming: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    math: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    management: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    database: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    networks: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    systems: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    software: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    statistics: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    physics: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    chemistry: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    language: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    ethics: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
    other: { gradeCounts: {}, totalGrades: 0, totalPoints: 0, totalCredits: 0, weightedGrades: [] },
  };

  // Process all semesters with recency weighting
  semesters.forEach((semester, semesterIndex) => {
    const recencyWeight = Math.max(0.3, 1 - (semesters.length - 1 - semesterIndex) * 0.1); // Recent semesters weighted higher
    
    semester.subjects.forEach((subject) => {
      if (subject.isGpa === false) return;
      const category = assignCategory(subject.name);
      const grade = subject.grade;
      
      // Initialize grade count if not exists
      if (!categories[category].gradeCounts[grade]) {
        categories[category].gradeCounts[grade] = 0;
      }
      
      // Add weighted grade occurrence
      categories[category].weightedGrades.push({
        grade,
        weight: recencyWeight,
        semesterIndex
      });
      
      categories[category].gradeCounts[grade] += recencyWeight;
      categories[category].totalGrades += recencyWeight;
      categories[category].totalPoints += getGradePoint(grade, gpaScale) * subject.credits * recencyWeight;
      categories[category].totalCredits += subject.credits;
    });
  });

  // Build probability models
  const models: Record<string, CategoryProbabilityModel> = {};
  
  Object.entries(categories).forEach(([category, data]) => {
    const distribution: GradeProbabilityDistribution = {
      "A+": 0, "A": 0, "A-": 0, "B+": 0, "B": 0, "B-": 0,
      "C+": 0, "C": 0, "C-": 0, "D+": 0, "D": 0, "F": 0, "E": 0
    };
    
    // Convert weighted counts to probabilities
    if (data.totalGrades > 0) {
      Object.entries(data.gradeCounts).forEach(([grade, weightedCount]) => {
        distribution[grade as keyof GradeProbabilityDistribution] = weightedCount / data.totalGrades;
      });
    }
    
    // Normalize equivalent grades (A+ = A when both worth same points)
    const aplusPoints = getGradePoint("A+", gpaScale);
    const aPoints = getGradePoint("A", gpaScale);
    if (aplusPoints === aPoints) {
      const avgProb = (distribution["A+"] + distribution["A"]) / 2;
      distribution["A+"] = avgProb;
      distribution["A"] = avgProb;
    }
    
    // Calculate confidence based on sample size and recency distribution
    const uniqueSemesters = new Set(data.weightedGrades.map(g => g.semesterIndex)).size;
    const avgWeight = data.weightedGrades.reduce((sum, g) => sum + g.weight, 0) / Math.max(data.weightedGrades.length, 1);
    const confidence = Math.min(1.0, (data.totalGrades * 0.1) * (uniqueSemesters * 0.2) * avgWeight);
    
    models[category] = {
      distribution,
      totalGrades: data.totalGrades,
      average: data.totalCredits > 0 ? data.totalPoints / data.totalCredits : 0,
      credits: data.totalCredits,
      confidence
    };
  });
  
  return models;
}

/**
 * Classify performance level in a category
 * Used to determine difficulty and scoring for recommendations
 * @param average - Average GPA in category
 * @returns "strong" if >= 3.7, "moderate" if >= 3.3, "weak" otherwise
 */
export function getCategoryStrength(average: number): "strong" | "moderate" | "weak" {
  if (average >= STRONG_CATEGORY_THRESHOLD) return "strong";
  if (average >= MODERATE_CATEGORY_THRESHOLD) return "moderate";
  return "weak";
}
