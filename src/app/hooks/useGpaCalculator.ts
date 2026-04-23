import { useState, useEffect, useCallback } from "react";
import { useUniStorage } from "./useUniStorage";
import {
  Semester,
  Subject,
  GpaSettings,
  GpaProjection,
  ProjectionSubject,
  PlannerSubject,
} from "../components/gpa-calculator/types";
import {
  calculateCgpa,
  calculateSemesterGpa,
  runMonteCarloSimulation,
  generateInsightMessage,
  getEffectiveGpaScale,
} from "../components/gpa-calculator/utils/gpaPrediction";
import { GPA_CONFIG } from "../constants/appConfig";
import {
  normalizeGrade,
  roundGpa,
  type ValidationResult,
  validateSubjectForSemester,
  validateWalletName,
} from "../utils/validation";

const defaultSettings: GpaSettings = {
  gradingMode: "standard",
  gpaScale: 4.0,
  degreeClasses: {
    firstClass: 3.7,
    secondUpper: 3.3,
    secondLower: 3.0,
    general: 2.0,
  },
};

export function useGpaCalculator() {
  const [semesters, setSemestersRaw] = useUniStorage<Semester[]>("gpa-semesters", []);
  const [settings, setSettings] = useUniStorage<GpaSettings>("gpa-settings", defaultSettings);
  const [projection, setProjection] = useState<GpaProjection>({ subjects: [], projectedGpa: 0 });
  const [simulationSubjects, setSimulationSubjects] = useUniStorage<PlannerSubject[]>("gpa-simulation", []);

  const getExistingSubjectNames = useCallback(
    (semesterId: string, excludingSubjectId?: string) => {
      const semester = semesters.find((item) => item.id === semesterId);
      if (!semester) return [];
      return semester.subjects
        .filter((subject) => subject.id !== excludingSubjectId)
        .map((subject) => subject.name);
    },
    [semesters],
  );

  // Helper to sort semesters chronologically
  const sortSemesters = useCallback((semesters: Semester[]) => {
    const extractNumericPart = (value: string): number => {
      const match = value.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    return [...semesters].sort((firstSemester, secondSemester) => {
      const firstYear = extractNumericPart(firstSemester.year);
      const secondYear = extractNumericPart(secondSemester.year);
      if (firstYear !== secondYear) return secondYear - firstYear;
      const firstSemesterNum = extractNumericPart(firstSemester.semester);
      const secondSemesterNum = extractNumericPart(secondSemester.semester);
      return secondSemesterNum - firstSemesterNum;
    });
  }, []);

  // Wrapped setter that sorts
  const setSemesters = useCallback((value: Semester[] | ((prev: Semester[]) => Semester[])) => {
    const newValue = value instanceof Function ? value(semesters) : value;
    setSemestersRaw(sortSemesters(newValue));
  }, [semesters, setSemestersRaw, sortSemesters]);

  // Migration effect
  useEffect(() => {
    setSemestersRaw(currentSemesters => {
      let needsUpdate = false;
      const migrated = currentSemesters.map(semester => ({
        ...semester,
        subjects: semester.subjects.map(subject => {
          if (subject.isGpa === undefined) {
            needsUpdate = true;
            return { ...subject, isGpa: true };
          }
          return subject;
        })
      }));
      if (needsUpdate) {
        return sortSemesters(migrated);
      }
      return sortSemesters(currentSemesters);
    });
  }, [setSemestersRaw, sortSemesters]); // Run once on mount

  useEffect(() => {
    setSettings((currentSettings) => {
      if (currentSettings.gpaScale === undefined) {
        const gpaScale = currentSettings.gradingMode === "extended" ? 4.2 : 4.0;
        return { ...currentSettings, gpaScale };
      }
      return currentSettings;
    });
  }, [setSettings]);

  const addSemester = useCallback((year: string, semester: string) => {
    const newSemester: Semester = {
      id: Date.now().toString(),
      year,
      semester,
      subjects: [],
    };
    setSemesters([...semesters, newSemester]);
  }, [semesters, setSemesters]);

  const updateSemester = useCallback((id: string, updates: Partial<Semester>) => {
    setSemesters(semesters.map(sem => sem.id === id ? { ...sem, ...updates } : sem));
  }, [semesters, setSemesters]);

  const deleteSemester = useCallback((id: string) => {
    setSemesters(semesters.filter(sem => sem.id !== id));
  }, [semesters, setSemesters]);

  const addSubject = useCallback(
    (semesterId: string, subject: Omit<Subject, "id">): ValidationResult<Subject> => {
      const gpaScale = getEffectiveGpaScale(settings);
      const validation = validateSubjectForSemester(
        subject,
        getExistingSubjectNames(semesterId),
        gpaScale,
      );
      if (!validation.ok) {
        return validation;
      }

      const newSubject: Subject = {
        ...validation.value,
        id: Date.now().toString(),
      };
      setSemesters(
        semesters.map((semester) =>
          semester.id === semesterId
            ? { ...semester, subjects: [...semester.subjects, newSubject] }
            : semester,
        ),
      );
      return { ok: true, value: newSubject };
    },
    [getExistingSubjectNames, semesters, setSemesters, settings],
  );

  const updateSubject = useCallback(
    (
      semesterId: string,
      subjectId: string,
      updates: Partial<Subject>,
    ): ValidationResult<Subject> => {
      const semester = semesters.find((item) => item.id === semesterId);
      const currentSubject = semester?.subjects.find((item) => item.id === subjectId);
      if (!semester || !currentSubject) {
        return { ok: false, errors: { general: "Subject not found." } };
      }

      const candidateSubject = { ...currentSubject, ...updates };
      const gpaScale = getEffectiveGpaScale(settings);
      const validation = validateSubjectForSemester(
        candidateSubject,
        getExistingSubjectNames(semesterId, subjectId),
        gpaScale,
      );
      if (!validation.ok) {
        return validation;
      }

      const nextSubject: Subject = {
        ...currentSubject,
        ...validation.value,
      };
      setSemesters(
        semesters.map((semesterItem) =>
          semesterItem.id === semesterId
            ? {
                ...semesterItem,
                subjects: semesterItem.subjects.map((subjectItem) =>
                  subjectItem.id === subjectId ? nextSubject : subjectItem,
                ),
              }
            : semesterItem,
        ),
      );
      return { ok: true, value: nextSubject };
    },
    [getExistingSubjectNames, semesters, setSemesters, settings],
  );

  const deleteSubject = useCallback((semesterId: string, subjectId: string) => {
    setSemesters(semesters.map(sem =>
      sem.id === semesterId
        ? { ...sem, subjects: sem.subjects.filter(sub => sub.id !== subjectId) }
        : sem
    ));
  }, [semesters, setSemesters]);

  const getCgpa = useCallback(() => {
    const gpaScale = getEffectiveGpaScale(settings);
    return calculateCgpa(semesters, gpaScale);
  }, [semesters, settings]);

  const getSemesterGpa = useCallback((semesterId: string) => {
    const semester = semesters.find((s) => s.id === semesterId);
    const gpaScale = getEffectiveGpaScale(settings);
    return semester ? calculateSemesterGpa(semester.subjects, gpaScale) : 0;
  }, [semesters, settings]);

  const getTotalCredits = useCallback(() => {
    return semesters.reduce((total, sem) =>
      total + sem.subjects.reduce((semTotal, sub) => semTotal + sub.credits, 0), 0
    );
  }, [semesters]);

  const getGpaCredits = useCallback(() => {
    return semesters.reduce((total, sem) =>
      total + sem.subjects.reduce(
        (semTotal, sub) => semTotal + (sub.isGpa !== false ? sub.credits : 0),
        0
      ),
    0);
  }, [semesters]);

  const getDegreeClass = useCallback(() => {
    const cgpa = getCgpa();
    if (cgpa >= settings.degreeClasses.firstClass) return "First Class";
    if (cgpa >= settings.degreeClasses.secondUpper) return "Second Upper";
    if (cgpa >= settings.degreeClasses.secondLower) return "Second Lower";
    if (cgpa >= settings.degreeClasses.general) return "General Degree";
    return "Academic Warning";
  }, [getCgpa, settings.degreeClasses]);

  const updateSettings = useCallback(
    (newSettings: Partial<GpaSettings>) => {
      const gpaScale =
        newSettings.gpaScale ??
        (newSettings.gradingMode === "extended" ? 4.2 : newSettings.gradingMode === "standard" ? 4.0 : settings.gpaScale);
      const gradingMode =
        newSettings.gradingMode ?? (gpaScale === 4.2 ? "extended" : "standard");

      setSettings({
        ...settings,
        ...newSettings,
        gpaScale,
        gradingMode,
      });

      setSemesters((currentSemesters) =>
        currentSemesters.map((semester) => ({
          ...semester,
          subjects: semester.subjects.map((subject) => ({
            ...subject,
            grade: normalizeGrade(subject.grade, gpaScale) || "A",
          })),
        })),
      );

      setSimulationSubjects((currentSubjects) =>
        currentSubjects.map((subject) => ({
          ...subject,
          grade: normalizeGrade(subject.grade, gpaScale) || "A",
          lockedGrade: subject.lockedGrade
            ? normalizeGrade(subject.lockedGrade, gpaScale) || undefined
            : undefined,
        })),
      );
    },
    [setSemesters, setSettings, setSimulationSubjects, settings],
  );

  // Projection tool
  const addProjectionSubject = useCallback((subject: Omit<ProjectionSubject, "id">) => {
    const newSubject: ProjectionSubject = {
      ...subject,
      id: Date.now().toString(),
    };
    const newSubjects = [...projection.subjects, newSubject];
    const projectedGpa = calculateSemesterGpa(newSubjects, getEffectiveGpaScale(settings));
    setProjection({ subjects: newSubjects, projectedGpa });
  }, [projection.subjects, settings]);

  const updateProjectionSubject = useCallback((id: string, updates: Partial<ProjectionSubject>) => {
    const newSubjects = projection.subjects.map(sub =>
      sub.id === id ? { ...sub, ...updates } : sub
    );
    const projectedGpa = calculateSemesterGpa(newSubjects, getEffectiveGpaScale(settings));
    setProjection({ subjects: newSubjects, projectedGpa });
  }, [projection.subjects, settings]);

  const deleteProjectionSubject = useCallback((id: string) => {
    const newSubjects = projection.subjects.filter(sub => sub.id !== id);
    const projectedGpa = calculateSemesterGpa(newSubjects, getEffectiveGpaScale(settings));
    setProjection({ subjects: newSubjects, projectedGpa });
  }, [projection.subjects, settings]);

  const clearProjection = useCallback(() => {
    setProjection({ subjects: [], projectedGpa: 0 });
  }, []);

  const addSimulationSubject = useCallback(
    (subject: Omit<PlannerSubject, "id">): ValidationResult<PlannerSubject> => {
      const validation = validateSubjectForSemester(
        subject,
        simulationSubjects.map((item) => item.name),
        getEffectiveGpaScale(settings),
      );
      if (!validation.ok) {
        return validation;
      }

      const newSubject: PlannerSubject = {
        id: Date.now().toString(),
        name: validation.value.name,
        credits: validation.value.credits,
        grade: validation.value.grade,
        category: subject.category,
        lockedGrade: subject.lockedGrade
          ? normalizeGrade(subject.lockedGrade, getEffectiveGpaScale(settings)) || undefined
          : undefined,
      };
      setSimulationSubjects([...simulationSubjects, newSubject]);
      return { ok: true, value: newSubject };
    },
    [setSimulationSubjects, settings, simulationSubjects],
  );

  const updateSimulationSubject = useCallback(
    (
      id: string,
      updates: Partial<PlannerSubject>,
    ): ValidationResult<PlannerSubject> => {
      const currentSubject = simulationSubjects.find((item) => item.id === id);
      if (!currentSubject) {
        return { ok: false, errors: { general: "Subject not found." } };
      }

      const candidate = { ...currentSubject, ...updates };
      const validation = validateSubjectForSemester(
        candidate,
        simulationSubjects
          .filter((item) => item.id !== id)
          .map((item) => item.name),
        getEffectiveGpaScale(settings),
      );
      if (!validation.ok) {
        return validation;
      }

      const nextSubject: PlannerSubject = {
        ...currentSubject,
        ...validation.value,
        category: candidate.category,
        lockedGrade: candidate.lockedGrade
          ? normalizeGrade(candidate.lockedGrade, getEffectiveGpaScale(settings)) || undefined
          : undefined,
      };

      setSimulationSubjects(
        simulationSubjects.map((subject) => (subject.id === id ? nextSubject : subject)),
      );
      return { ok: true, value: nextSubject };
    },
    [setSimulationSubjects, settings, simulationSubjects],
  );

  const deleteSimulationSubject = useCallback((id: string) => {
    setSimulationSubjects(simulationSubjects.filter((sub) => sub.id !== id));
  }, [simulationSubjects, setSimulationSubjects]);

  const clearSimulationSubjects = useCallback(() => {
    setSimulationSubjects([]);
  }, [setSimulationSubjects]);

  // Degree class prediction
  const getDegreePrediction = useCallback(() => {
    const completedSemesters = semesters.length;
    const totalSemesters = GPA_CONFIG.TOTAL_SEMESTERS; // Use centralized constant instead of hardcoded 8
    const creditsCompleted = getGpaCredits();
    const currentCgpa = getCgpa();

    return runMonteCarloSimulation(
      currentCgpa,
      creditsCompleted,
      completedSemesters,
      totalSemesters,
      settings
    );
  }, [semesters.length, getGpaCredits, getCgpa, settings]);

  const getInsightMessage = useCallback(() => {
    const prediction = getDegreePrediction();
    const currentCgpa = getCgpa();
    const remainingSemesters = GPA_CONFIG.TOTAL_SEMESTERS - semesters.length; // Use centralized constant instead of hardcoded 8
    return generateInsightMessage(prediction, currentCgpa, remainingSemesters, settings.degreeClasses);
  }, [getDegreePrediction, getCgpa, semesters.length, settings.degreeClasses]);

  return {
    semesters,
    settings,
    projection,
    addSemester,
    updateSemester,
    deleteSemester,
    addSubject,
    updateSubject,
    deleteSubject,
    getCgpa,
    getSemesterGpa,
    getTotalCredits,
    getGpaCredits,
    getDegreeClass,
    updateSettings,
    addProjectionSubject,
    updateProjectionSubject,
    deleteProjectionSubject,
    clearProjection,
    simulationSubjects,
    addSimulationSubject,
    updateSimulationSubject,
    deleteSimulationSubject,
    clearSimulationSubjects,
    getDegreePrediction,
    getInsightMessage,
  };
}
