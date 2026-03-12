import { useState, useEffect, useCallback } from "react";
import { useUniStorage } from "./useUniStorage";
import { Semester, Subject, GpaSettings, GpaProjection, ProjectionSubject } from "../components/gpa-calculator/types";
import {
  calculateCgpa,
  calculateSemesterGpa,
  runMonteCarloSimulation,
  generateInsightMessage,
} from "../components/gpa-calculator/utils/gpaPrediction";

const defaultSettings: GpaSettings = {
  gradingMode: "standard",
  degreeClasses: {
    firstClass: 3.7,
    secondUpper: 3.3,
    secondLower: 3.0,
    general: 2.0,
  },
};

export function useGpaCalculator() {
  const [semesters, setSemesters] = useUniStorage<Semester[]>("gpa-semesters", []);
  const [settings, setSettings] = useUniStorage<GpaSettings>("gpa-settings", defaultSettings);
  const [projection, setProjection] = useState<GpaProjection>({ subjects: [], projectedGpa: 0 });

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

  const addSubject = useCallback((semesterId: string, subject: Omit<Subject, "id">) => {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
    };
    setSemesters(semesters.map(sem =>
      sem.id === semesterId
        ? { ...sem, subjects: [...sem.subjects, newSubject] }
        : sem
    ));
  }, [semesters, setSemesters]);

  const updateSubject = useCallback((semesterId: string, subjectId: string, updates: Partial<Subject>) => {
    setSemesters(semesters.map(sem =>
      sem.id === semesterId
        ? {
            ...sem,
            subjects: sem.subjects.map(sub =>
              sub.id === subjectId ? { ...sub, ...updates } : sub
            )
          }
        : sem
    ));
  }, [semesters, setSemesters]);

  const deleteSubject = useCallback((semesterId: string, subjectId: string) => {
    setSemesters(semesters.map(sem =>
      sem.id === semesterId
        ? { ...sem, subjects: sem.subjects.filter(sub => sub.id !== subjectId) }
        : sem
    ));
  }, [semesters, setSemesters]);

  const getCgpa = useCallback(() => {
    return calculateCgpa(semesters, settings.gradingMode);
  }, [semesters, settings.gradingMode]);

  const getSemesterGpa = useCallback((semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? calculateSemesterGpa(semester.subjects, settings.gradingMode) : 0;
  }, [semesters, settings.gradingMode]);

  const getTotalCredits = useCallback(() => {
    return semesters.reduce((total, sem) =>
      total + sem.subjects.reduce((semTotal, sub) => semTotal + sub.credits, 0), 0
    );
  }, [semesters]);

  const getDegreeClass = useCallback(() => {
    const cgpa = getCgpa();
    if (cgpa >= settings.degreeClasses.firstClass) return "First Class";
    if (cgpa >= settings.degreeClasses.secondUpper) return "Second Upper";
    if (cgpa >= settings.degreeClasses.secondLower) return "Second Lower";
    if (cgpa >= settings.degreeClasses.general) return "General Degree";
    return "Academic Warning";
  }, [getCgpa, settings.degreeClasses]);

  const updateSettings = useCallback((newSettings: Partial<GpaSettings>) => {
    setSettings({ ...settings, ...newSettings });
  }, [settings, setSettings]);

  // Projection tool
  const addProjectionSubject = useCallback((subject: Omit<ProjectionSubject, "id">) => {
    const newSubject: ProjectionSubject = {
      ...subject,
      id: Date.now().toString(),
    };
    const newSubjects = [...projection.subjects, newSubject];
    const projectedGpa = calculateSemesterGpa(newSubjects, settings.gradingMode);
    setProjection({ subjects: newSubjects, projectedGpa });
  }, [projection.subjects, settings.gradingMode]);

  const updateProjectionSubject = useCallback((id: string, updates: Partial<ProjectionSubject>) => {
    const newSubjects = projection.subjects.map(sub =>
      sub.id === id ? { ...sub, ...updates } : sub
    );
    const projectedGpa = calculateSemesterGpa(newSubjects, settings.gradingMode);
    setProjection({ subjects: newSubjects, projectedGpa });
  }, [projection.subjects, settings.gradingMode]);

  const deleteProjectionSubject = useCallback((id: string) => {
    const newSubjects = projection.subjects.filter(sub => sub.id !== id);
    const projectedGpa = calculateSemesterGpa(newSubjects, settings.gradingMode);
    setProjection({ subjects: newSubjects, projectedGpa });
  }, [projection.subjects, settings.gradingMode]);

  const clearProjection = useCallback(() => {
    setProjection({ subjects: [], projectedGpa: 0 });
  }, []);

  // Degree class prediction
  const getDegreePrediction = useCallback(() => {
    const completedSemesters = semesters.length;
    const totalSemesters = 8; // Assume 4 years, 2 semesters each
    const creditsCompleted = getTotalCredits();
    const currentCgpa = getCgpa();

    return runMonteCarloSimulation(
      currentCgpa,
      creditsCompleted,
      completedSemesters,
      totalSemesters,
      settings
    );
  }, [semesters.length, getTotalCredits, getCgpa, settings]);

  const getInsightMessage = useCallback(() => {
    const prediction = getDegreePrediction();
    const currentCgpa = getCgpa();
    const remainingSemesters = 8 - semesters.length; // Assume 8 total semesters
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
    getDegreeClass,
    updateSettings,
    addProjectionSubject,
    updateProjectionSubject,
    deleteProjectionSubject,
    clearProjection,
    getDegreePrediction,
    getInsightMessage,
  };
}