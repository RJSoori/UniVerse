import { Semester, GpaSettings, DegreeClassPrediction } from "../types";

export function getGradePoint(grade: string, gradingMode: "standard" | "extended"): number {
  const points: Record<string, number> = {
    "A+": gradingMode === "extended" ? 4.2 : 4.0,
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D": 1.0,
    "E": 0.0,
  };
  return points[grade] || 0;
}

export function calculateSemesterGpa(subjects: any[], gradingMode: "standard" | "extended"): number {
  if (subjects.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;
  subjects.forEach((subject) => {
    totalPoints += getGradePoint(subject.grade, gradingMode) * subject.credits;
    totalCredits += subject.credits;
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function calculateCgpa(semesters: Semester[], gradingMode: "standard" | "extended"): number {
  let totalPoints = 0;
  let totalCredits = 0;
  semesters.forEach((sem) => {
    sem.subjects.forEach((subject) => {
      totalPoints += getGradePoint(subject.grade, gradingMode) * subject.credits;
      totalCredits += subject.credits;
    });
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function simulateFutureGpa(minGpa: number = 2.5, maxGpa: number = 4.2): number {
  return Math.random() * (maxGpa - minGpa) + minGpa;
}

export function calculateFinalCgpa(
  currentCgpa: number,
  creditsCompleted: number,
  futureGpas: number[],
  avgCreditsPerSemester: number
): number {
  const existingPoints = currentCgpa * creditsCompleted;
  const futurePoints = futureGpas.reduce((sum, gpa) => sum + gpa * avgCreditsPerSemester, 0);
  const totalCredits = creditsCompleted + futureGpas.length * avgCreditsPerSemester;
  return totalCredits > 0 ? (existingPoints + futurePoints) / totalCredits : 0;
}

export function classifyDegree(cgpa: number, thresholds: GpaSettings["degreeClasses"]): string {
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
  simulations: number = 1000
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

  const avgCreditsPerSemester = creditsCompleted / completedSemesters;
  const maxGpa = settings.gradingMode === "extended" ? 4.2 : 4.0;

  const results = {
    firstClass: 0,
    secondUpper: 0,
    secondLower: 0,
    general: 0,
  };

  for (let i = 0; i < simulations; i++) {
    const futureGpas = Array.from({ length: remainingSemesters }, () =>
      simulateFutureGpa(2.5, maxGpa)
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

  if (bestClass === "firstClass" && highestProb > 50) {
    return "You have a strong chance of achieving First Class honors!";
  }
  if (bestClass === "secondUpper" && highestProb > 50) {
    return "You're on track for Second Upper classification.";
  }
  if (currentCgpa >= thresholds.firstClass) {
    return "Congratulations! You've already achieved First Class standing!";
  }
  if (currentCgpa >= thresholds.secondUpper) {
    return "You're performing well. Maintain your current grades to secure Second Upper.";
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