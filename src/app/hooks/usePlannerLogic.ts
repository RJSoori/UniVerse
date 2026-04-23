import { useState, useCallback } from "react";
import { getTargetGpaResult } from "../components/gpa-calculator/utils/targetGpaCalculator";
import { getEffectiveGpaScale } from "../components/gpa-calculator/utils/gpaPrediction";
import {
  validatePlannerInputs,
  validateRecommendationFeasibility,
} from "./validation";

interface PlannerInputs {
  targetCgpa: string;
  nextCredits: string;
}

interface PlannerResult {
  requiredSgpa: number;
  feasible: boolean;
  difficulty: string;
  message: string;
}

interface UsePlannerLogicProps {
  currentCgpa: number;
  completedCredits: number;
  maxGpa: number;
}

export function usePlannerLogic({
  currentCgpa,
  completedCredits,
  maxGpa,
}: UsePlannerLogicProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlannerResult | null>(null);

  const validateAndCalculate = useCallback(
    (inputs: PlannerInputs): PlannerResult | null => {
      setErrors({});

      // Validate inputs
      const validation = validatePlannerInputs(
        {
          targetCgpa: inputs.targetCgpa,
          nextCredits: inputs.nextCredits,
        },
        maxGpa
      );

      if (!validation.ok) {
        setErrors(validation.errors);
        setResult(null);
        return null;
      }

      // Calculate required SGPA
      const calculationResult = getTargetGpaResult(
        currentCgpa,
        completedCredits,
        validation.value.nextCredits,
        validation.value.targetCgpa,
        maxGpa
      );

      // Check feasibility
      const feasibility = validateRecommendationFeasibility(
        calculationResult.requiredSgpa,
        maxGpa
      );

      if (!feasibility.ok) {
        setErrors(feasibility.errors);
      }

      // Create result object with user-friendly difficulty assessment
      const difficulty =
        calculationResult.requiredSgpa > maxGpa * 0.9
          ? "Very Difficult"
          : calculationResult.requiredSgpa > maxGpa * 0.7
            ? "Challenging"
            : "Achievable";

      const plannerResult: PlannerResult = {
        requiredSgpa: calculationResult.requiredSgpa,
        feasible: feasibility.ok,
        difficulty,
        message: feasibility.ok
          ? `You need an SGPA of ${calculationResult.requiredSgpa.toFixed(2)} to reach ${inputs.targetCgpa}`
          : "Target CGPA is not feasible with current GPA scale",
      };

      setResult(plannerResult);
      return plannerResult;
    },
    [currentCgpa, completedCredits, maxGpa]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setErrors({});
  }, []);

  return {
    errors,
    result,
    validateAndCalculate,
    clearResult,
  };
}
