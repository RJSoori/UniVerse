import {
  roundGpa,
  safeCompare,
  validateRecommendationFeasibility,
} from "../../../utils/validation";

export interface TargetGpaResult {
  requiredSgpa: number;
  isFeasible: boolean;
  maxPossibleCgpa: number;
  message: string;
  insight: string;
  difficulty: "IMPOSSIBLE" | "VERY HARD" | "CHALLENGING" | "ACHIEVABLE";
}

export function calculateRequiredSGPA(
  currentCgpa: number,
  completedCredits: number,
  nextCredits: number,
  targetCgpa: number
): number {
  const currentTotalPoints = currentCgpa * completedCredits;
  const targetTotalCredits = completedCredits + nextCredits;
  const requiredTotalPoints = targetCgpa * targetTotalCredits;
  const requiredNextSemesterPoints = requiredTotalPoints - currentTotalPoints;
  const requiredSgpa = requiredNextSemesterPoints / nextCredits;
  return roundGpa(requiredSgpa);
}

export function calculateMaxPossibleCGPA(
  currentCgpa: number,
  completedCredits: number,
  nextCredits: number,
  maxGpa: number
): number {
  const currentTotalPoints = currentCgpa * completedCredits;
  const targetTotalCredits = completedCredits + nextCredits;
  const maxNextSemesterPoints = maxGpa * nextCredits;
  const newTotalPoints = currentTotalPoints + maxNextSemesterPoints;
  const maxPossibleCgpa = newTotalPoints / targetTotalCredits;
  return roundGpa(maxPossibleCgpa);
}

export function validateTargetFeasibility(requiredSgpa: number, maxGpa: number): boolean {
  return safeCompare(requiredSgpa, maxGpa) <= 0;
}

export function getTargetGpaResult(
  currentCgpa: number,
  completedCredits: number,
  nextCredits: number,
  targetCgpa: number,
  maxGpa: number
): TargetGpaResult {
  const calculatedRequiredSgpa = Math.max(
    0,
    calculateRequiredSGPA(currentCgpa, completedCredits, nextCredits, targetCgpa),
  );
  const feasibility = validateRecommendationFeasibility(calculatedRequiredSgpa, maxGpa);
  const requiredSgpa =
    feasibility.ok ? feasibility.value.requiredSgpa : calculatedRequiredSgpa;
  const isFeasible = feasibility.ok && validateTargetFeasibility(requiredSgpa, maxGpa);
  const maxPossibleCgpa = calculateMaxPossibleCGPA(currentCgpa, completedCredits, nextCredits, maxGpa);

  let message = "";
  let insight = "";
  let difficulty: TargetGpaResult["difficulty"] = "ACHIEVABLE";

  if (!isFeasible) {
    difficulty = "IMPOSSIBLE";
    message = "Target is not achievable with given credits.";
    insight = `Maximum possible CGPA: ${maxPossibleCgpa.toFixed(2)}.`;
  } else {
    if (requiredSgpa > maxGpa - 0.1) {
      difficulty = "VERY HARD";
    } else if (requiredSgpa > maxGpa - 0.3) {
      difficulty = "CHALLENGING";
    } else {
      difficulty = "ACHIEVABLE";
    }

    message = `You need an SGPA of ${requiredSgpa.toFixed(2)} next semester to reach CGPA ${targetCgpa}.`;
    if (difficulty === "VERY HARD") {
      insight = "This will require near-perfect grades and strong effort.";
    } else if (difficulty === "CHALLENGING") {
      insight = "This is challenging but achievable with consistent good performance.";
    } else {
      insight = "This target is within reach with steady effort.";
    }
  }

  return {
    requiredSgpa,
    isFeasible,
    maxPossibleCgpa,
    message,
    insight,
    difficulty,
  };
}
