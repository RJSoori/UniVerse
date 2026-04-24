/**
 * Best-First Search Engine for GPA Recommendations
 * 
 * Implements intelligent search using a priority queue (max-heap) to explore
 * the most promising grade combinations first, avoiding exhaustive enumeration.
 * 
 * Algorithm:
 * 1. Start with empty combination, estimate its potential max score
 * 2. Add to priority queue ordered by estimated score
 * 3. Pop highest-scoring node, expand to next subject
 * 4. Each expansion tries multiple grade options (A+, A, A-, ...)
 * 5. Prune branches that cannot possibly achieve required SGPA
 * 6. Stop when we have 100 valid combinations or queue is empty
 */

import { PlannerSubject, PlannerGrade } from "../components/gpa-calculator/types";
import { getGradePoint } from "../components/gpa-calculator/utils/gpaPrediction";
import { getGradesPreferringEasiest } from "./gpaCombinationUtils";
import { CategoryProbabilityModel } from "./gpaPerformanceUtils";
import {
  MAX_RECOMMENDATION_RESULTS,
  MAX_RECOMMENDATION_STATE_EXPANSIONS,
} from "../constants/gradeScales";
import { normalizeGrade } from "./validation";

/**
 * Max-Heap Priority Queue for efficient exploration ordering
 * Higher scores = higher priority (popped first)
 */
class MaxHeapPriorityQueue {
  private heap: Array<{ score: number; data: any }> = [];

  enqueue(score: number, data: any): void {
    this.heap.push({ score, data });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): { score: number; data: any } | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].score > this.heap[parentIndex].score) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].score > this.heap[largest].score
      ) {
        largest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].score > this.heap[largest].score
      ) {
        largest = rightChild;
      }

      if (largest !== index) {
        [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
        index = largest;
      } else {
        break;
      }
    }
  }
}

interface SearchNode {
  combination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>;
  subjectIndex: number; // Which subject are we currently assigning a grade to
  currentPoints: number;
  currentCredits: number;
  estimatedMaxScore: number; // Upper bound on possible score
}

/**
 * Best-First Search: Intelligently explore grade combinations using a priority queue
 * 
 * This is more efficient than generating all combinations because:
 * 1. Only explores promising branches (high probability of good scores)
 * 2. Prunes branches that can't possibly meet required SGPA
 * 3. Returns top 100 results without computing all (potentially millions of) combinations
 * 
 * @param subjects - List of subjects to assign grades to
 * @param requiredSgpa - Target SGPA to reach
 * @param gpaScale - GPA scale (4.0 or 4.2)
 * @param probabilityModels - Probability distributions for realistic scoring
 * @returns Array of up to 100 promising combinations sorted by estimated score
 */
export function bestFirstSearch(
  subjects: PlannerSubject[],
  requiredSgpa: number,
  gpaScale: number,
  probabilityModels: Record<string, CategoryProbabilityModel>
): Array<{ subject: PlannerSubject; grade: PlannerGrade }[]> {
  if (subjects.length === 0) return [];

  const gradeOptions = getGradesPreferringEasiest(gpaScale);
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const requiredPoints = requiredSgpa * totalCredits;

  const queue = new MaxHeapPriorityQueue();
  const completedCombinations: Array<{ subject: PlannerSubject; grade: PlannerGrade }[]> = [];
  const visited = new Set<string>(); // Track visited states to avoid redundant exploration
  let expansions = 0;

  // Start: empty combination, try grades for first subject
  const firstSubject = subjects[0];
  for (const grade of gradeOptions) {
    const points = getGradePoint(grade, gpaScale) * firstSubject.credits;
    const estimatedMaxScore = estimateMaxPossibleScore(
      [{ subject: firstSubject, grade }],
      subjects.slice(1),
      gpaScale,
      requiredPoints,
      probabilityModels
    );

    queue.enqueue(estimatedMaxScore, {
      combination: [{ subject: firstSubject, grade }],
      subjectIndex: 1,
      currentPoints: points,
      currentCredits: firstSubject.credits,
      estimatedMaxScore,
    } as SearchNode);
  }

  // Explore nodes in order of estimated score (highest first)
  while (
    !queue.isEmpty() &&
    completedCombinations.length < MAX_RECOMMENDATION_RESULTS &&
    expansions < MAX_RECOMMENDATION_STATE_EXPANSIONS
  ) {
    const node = queue.dequeue();
    if (!node) break;
    expansions += 1;

    const data = node.data as SearchNode;
    const { combination, subjectIndex, currentPoints, currentCredits } = data;

    // Generate state key to avoid redundant exploration
    const stateKey = combination
      .map((c) => normalizeGrade(c.grade, gpaScale) || c.grade)
      .join(",");
    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    // Base case: all subjects assigned
    if (subjectIndex >= subjects.length) {
      completedCombinations.push(combination);
      continue;
    }

    // Check if remaining subjects can possibly meet target
    const remainingSubjects = subjects.slice(subjectIndex);
    const maxPossiblePoints =
      currentPoints + remainingSubjects.reduce((sum, s) => sum + getGradePoint("A+", gpaScale) * s.credits, 0);

    if (maxPossiblePoints < requiredPoints * 0.9) {
      // If even with all A+ we can't reach 90% of target, prune this branch
      continue;
    }

    // Expand: try each grade for next subject
    const nextSubject = subjects[subjectIndex];
    for (const grade of gradeOptions) {
      const newPoints = currentPoints + getGradePoint(grade, gpaScale) * nextSubject.credits;
      const newCombination = [...combination, { subject: nextSubject, grade }];
      const newCredits = currentCredits + nextSubject.credits;

      const estimatedMaxScore = estimateMaxPossibleScore(
        newCombination,
        subjects.slice(subjectIndex + 1),
        gpaScale,
        requiredPoints,
        probabilityModels
      );

      queue.enqueue(estimatedMaxScore, {
        combination: newCombination,
        subjectIndex: subjectIndex + 1,
        currentPoints: newPoints,
        currentCredits: newCredits,
        estimatedMaxScore,
      } as SearchNode);
    }
  }

  return completedCombinations;
}

/**
 * Estimate the maximum possible score for a partial combination
 * Used for priority queue ordering - higher estimate = explored first
 * 
 * Heuristic: Assume we'll get high-probability grades for remaining subjects
 * This is an upper bound that guides search toward promising branches
 */
function estimateMaxPossibleScore(
  partialCombination: Array<{ subject: PlannerSubject; grade: PlannerGrade }>,
  remainingSubjects: PlannerSubject[],
  gpaScale: number,
  requiredPoints: number,
  probabilityModels: Record<string, CategoryProbabilityModel>
): number {
  let score = 0;

  // Score for already-assigned grades
  for (const { subject, grade } of partialCombination) {
    const model = probabilityModels[subject.category];
    if (model) {
      const probability = model.distribution[grade] || 0.01;
      score += probability * 10 * model.confidence;
    } else {
      score += 5; // Neutral estimate when no model available
    }
  }

  // Estimate for remaining subjects: assume we'll get modestly good grades
  for (const subject of remainingSubjects) {
    const model = probabilityModels[subject.category];
    if (model) {
      // Assume we'll get a B+ or higher (reasonable middle estimate)
      const probabilities = [
        model.distribution["A+"] || 0,
        model.distribution["A"] || 0,
        model.distribution["A-"] || 0,
        model.distribution["B+"] || 0,
      ];
      const avgHighGradeProbability = probabilities.reduce((a, b) => a + b, 0) / probabilities.length;
      score += avgHighGradeProbability * 10 * (model.confidence || 0.7);
    } else {
      score += 5;
    }
  }

  // Bonus if we meet or exceed required points
  const currentPoints = partialCombination.reduce(
    (sum, { subject, grade }) => sum + getGradePoint(grade, gpaScale) * subject.credits,
    0
  );
  if (currentPoints >= requiredPoints) {
    score += 10;
  }

  return score;
}
