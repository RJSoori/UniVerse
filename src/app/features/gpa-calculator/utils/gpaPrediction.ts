import { Semester, GpaSettings, DegreeClassPrediction } from "../types";
import {
  SIMULATION_GPA_MIN,
  SIMULATION_GPA_MAX_4_0,
  SIMULATION_GPA_MAX_4_2,
  MONTE_CARLO_SIMULATIONS,
} from "../constants/gradeScales";
import { normalizeGrade, roundGpa } from "../../../shared/validation";

/**
 * Get the effective GPA scale from settings, with fallback logic
 * @param settings - GPA settings object
 * @returns The effective GPA scale (4.0 or 4.2)
 */
export function getEffectiveGpaScale(settings: GpaSettings): number {
  return settings.gpaScale ?? (settings.gradingMode === "extended" ? 4.2 : 4.0);
}

function getGradePointsMap(gpaScale: number): Record<string, number> {
  return {
    "A+": gpaScale === 4.2 ? 4.2 : 4.0,
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
    "E": 0.0,
  };
}

export function getGradePoint(grade: string, gpaScale: number): number {
  const points = getGradePointsMap(gpaScale);
  const normalizedGrade = normalizeGrade(grade, gpaScale);
  return points[normalizedGrade || grade] || 0;
}

export function calculateSemesterGpa(subjects: any[], gpaScale: number): number {
  const gpaSubjects = subjects.filter((subject) => subject.isGpa !== false); // default true if undefined
  if (gpaSubjects.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;
  gpaSubjects.forEach((subject) => {
    totalPoints += getGradePoint(subject.grade, gpaScale) * subject.credits;
    totalCredits += subject.credits;
  });
  return totalCredits > 0 ? roundGpa(totalPoints / totalCredits) : 0;
}

export function calculateCgpa(semesters: Semester[], gpaScale: number): number {
  let totalPoints = 0;
  let totalCredits = 0;
  semesters.forEach((sem) => {
    const gpaSubjects = sem.subjects.filter((subject) => subject.isGpa !== false);
    gpaSubjects.forEach((subject) => {
      totalPoints += getGradePoint(subject.grade, gpaScale) * subject.credits;
      totalCredits += subject.credits;
    });
  });
  return totalCredits > 0 ? roundGpa(totalPoints / totalCredits) : 0;
}

function simulateFutureGpa(minGpa: number = SIMULATION_GPA_MIN, maxGpa: number = SIMULATION_GPA_MAX_4_2): number {
  return Math.random() * (maxGpa - minGpa) + minGpa;
}

function calculateFinalCgpa(
  currentCgpa: number,
  creditsCompleted: number,
  futureGpas: number[],
  avgCreditsPerSemester: number
): number {
  const existingPoints = currentCgpa * creditsCompleted;
  const futurePoints = futureGpas.reduce((sum, gpa) => sum + gpa * avgCreditsPerSemester, 0);
  const totalCredits = creditsCompleted + futureGpas.length * avgCreditsPerSemester;
  return totalCredits > 0 ? roundGpa((existingPoints + futurePoints) / totalCredits) : 0;
}

function classifyDegree(cgpa: number, thresholds: GpaSettings["degreeClasses"]): string {
  if (cgpa >= thresholds.firstClass) return "First Class";
  if (cgpa >= thresholds.secondUpper) return "Second Upper";
  if (cgpa >= thresholds.secondLower) return "Second Lower";
  if (cgpa >= thresholds.general) return "General Degree";
  return "Academic Warning";
}

export function runMonteCarloSimulation(
  currentCgpa: number,
  creditsCompleted: number,
  completedSemesters: number,
  totalSemesters: number,
  settings: GpaSettings,
  simulations: number = MONTE_CARLO_SIMULATIONS
): DegreeClassPrediction {
  const remainingSemesters = totalSemesters - completedSemesters;
  if (remainingSemesters <= 0) {
    const currentClass = classifyDegree(currentCgpa, settings.degreeClasses);
    return {
      firstClass: currentClass === "First Class" ? 100 : 0,
      secondUpper: currentClass === "Second Upper" ? 100 : 0,
      secondLower: currentClass === "Second Lower" ? 100 : 0,
      general: currentClass === "General Degree" ? 100 : 0,
    };
  }

  const avgCreditsPerSemester = completedSemesters > 0 ? creditsCompleted / completedSemesters : 0;
  const maxGpa = (settings as any).gpaScale ?? (settings.gradingMode === "extended" ? SIMULATION_GPA_MAX_4_2 : SIMULATION_GPA_MAX_4_0);

  const results = {
    firstClass: 0,
    secondUpper: 0,
    secondLower: 0,
    general: 0,
  };

  for (let i = 0; i < simulations; i++) {
    const futureGpas = Array.from({ length: remainingSemesters }, () =>
      simulateFutureGpa(SIMULATION_GPA_MIN, maxGpa)
    );
    const finalCgpa = calculateFinalCgpa(
      currentCgpa,
      creditsCompleted,
      futureGpas,
      avgCreditsPerSemester
    );
    const degreeClass = classifyDegree(finalCgpa, settings.degreeClasses);
    // map string to result key
    switch (degreeClass) {
      case "First Class":
        results.firstClass++;
        break;
      case "Second Upper":
        results.secondUpper++;
        break;
      case "Second Lower":
        results.secondLower++;
        break;
      case "General Degree":
        results.general++;
        break;
      default:
        // Academic Warning falls under general for probability purposes
        results.general++;
        break;
    }
  }

  return {
    firstClass: Math.round((results.firstClass / simulations) * 100),
    secondUpper: Math.round((results.secondUpper / simulations) * 100),
    secondLower: Math.round((results.secondLower / simulations) * 100),
    general: Math.round((results.general / simulations) * 100),
  };
}

export function generateInsightMessage(
  prediction: DegreeClassPrediction,
  currentCgpa: number,
  remainingSemesters: number,
  thresholds: GpaSettings["degreeClasses"]
): string {
  const highestProb = Math.max(...Object.values(prediction));
  const bestClass = Object.keys(prediction).find(
    (key) => prediction[key as keyof DegreeClassPrediction] === highestProb
  );

  if (currentCgpa >= thresholds.firstClass) {
    return "Congratulations! You've already achieved First Class standing!";
  }
  if (currentCgpa >= thresholds.secondUpper) {
    return "You're performing well. Maintain your current grades to secure Second Upper.";
  }
  if (bestClass === "firstClass" && highestProb > 50) {
    return "You have a strong chance of achieving First Class honors!";
  }
  if (bestClass === "secondUpper" && highestProb > 50) {
    return "You're on track for Second Upper classification.";
  }
  if (currentCgpa === 0) {
    return "Start by adding your first semester and subject to track your academic progress.";
  }
  if (remainingSemesters > 0) {
    // Provide realistic guidance based on current performance
    const gpaGap = thresholds.firstClass - currentCgpa;
    if (gpaGap <= 0.3) {
      return "You're close to First Class! Maintain strong performance in remaining semesters.";
    } else if (gpaGap <= 0.6) {
      return "You can still reach First Class with consistent high performance (3.8+) in remaining semesters.";
    } else {
      return "Focus on improving your grades. The probability analysis shows your degree class prediction.";
    }
  }
  return "Keep up the good work in your studies!";
}
