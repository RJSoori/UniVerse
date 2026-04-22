export interface TargetGpaResult {
  requiredSgpa: number;
  isFeasible: boolean;
  maxPossibleCgpa: number;
  message: string;
  insight: string;
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
  return requiredSgpa;
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
  return maxPossibleCgpa;
}

export function validateTargetFeasibility(requiredSgpa: number, maxGpa: number): boolean {
  return requiredSgpa <= maxGpa;
}

export function getTargetGpaResult(
  currentCgpa: number,
  completedCredits: number,
  nextCredits: number,
  targetCgpa: number,
  maxGpa: number
): TargetGpaResult {
  const requiredSgpa = calculateRequiredSGPA(currentCgpa, completedCredits, nextCredits, targetCgpa);
  const isFeasible = validateTargetFeasibility(requiredSgpa, maxGpa);
  const maxPossibleCgpa = calculateMaxPossibleCGPA(currentCgpa, completedCredits, nextCredits, maxGpa);

  let message = "";
  let insight = "";

  if (isFeasible) {
    message = `You need an SGPA of ${requiredSgpa.toFixed(2)} next semester to reach CGPA ${targetCgpa}.`;
    if (requiredSgpa >= 3.7) {
      insight = "Your target is realistic if you maintain mostly A grades.";
    } else if (requiredSgpa >= 3.3) {
      insight = "Your target is achievable with consistent good performance.";
    } else {
      insight = "Your target is within reach with steady effort.";
    }
  } else {
    message = "This target GPA cannot be reached in one semester.";
    insight = `Even with perfect grades next semester, your CGPA would become approximately ${maxPossibleCgpa.toFixed(2)}.`;
  }

  return {
    requiredSgpa,
    isFeasible,
    maxPossibleCgpa,
    message,
    insight,
  };
}