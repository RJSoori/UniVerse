import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useUniStorage } from "../../../shared/hooks/useUniStorage";
import {
  Semester,
  Subject,
  GpaSettings,
  GpaProjection,
  ProjectionSubject,
  PlannerSubject,
} from "../types";
import {
  calculateCgpa,
  calculateSemesterGpa,
  runMonteCarloSimulation,
  generateInsightMessage,
  getEffectiveGpaScale,
} from "../utils/gpaPrediction";
import { GPA_CONFIG } from "../constants/config";
import {
  normalizeGrade,
  roundGpa,
  type ValidationResult,
  validateSubjectForSemester,
  validateWalletName,
} from "../../../shared/validation";
import {
  getStorageSanitizer,
  sanitizeStorageValue,
} from "../../../shared/validation";
import * as gpaCalculatorApi from "../utils/api";

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

function isDefaultSettings(value: GpaSettings): boolean {
  return (
    value.gradingMode === defaultSettings.gradingMode &&
    value.gpaScale === defaultSettings.gpaScale &&
    value.degreeClasses.firstClass ===
      defaultSettings.degreeClasses.firstClass &&
    value.degreeClasses.secondUpper ===
      defaultSettings.degreeClasses.secondUpper &&
    value.degreeClasses.secondLower ===
      defaultSettings.degreeClasses.secondLower &&
    value.degreeClasses.general === defaultSettings.degreeClasses.general
  );
}

function readLegacyGpaState() {
  if (typeof window === "undefined") {
    return null;
  }

  const readValue = <T,>(key: string, initialValue: T): T => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return initialValue;
      }

      const parsed = JSON.parse(raw);
      const sanitizer = getStorageSanitizer<T>(key);
      return sanitizeStorageValue(key, parsed, initialValue, sanitizer).value;
    } catch (error) {
      console.error(`Error reading legacy GPA data for ${key}:`, error);
      return initialValue;
    }
  };

  return {
    semesters: readValue<Semester[]>("gpa-semesters", []),
    settings: readValue<GpaSettings>("gpa-settings", defaultSettings),
  };
}

function clearLegacyGpaStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("gpa-semesters");
  window.localStorage.removeItem("gpa-settings");
}

function useGpaCalculatorImpl() {
  const [semesters, setSemestersState] = useState<Semester[]>([]);
  const [settings, setSettingsState] = useState<GpaSettings>(defaultSettings);
  const [projection, setProjection] = useState<GpaProjection>({
    subjects: [],
    projectedGpa: 0,
  });
  const [simulationSubjects, setSimulationSubjects] = useUniStorage<
    PlannerSubject[]
  >("gpa-simulation", []);
  const hasHydratedFromBackend = useRef(false);
  const loadTokenRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const studentId = "default-student"; // TODO: Get from user context/auth

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

  const sortSubjects = useCallback((subjects: Subject[]) => {
    return [...subjects].sort((firstSubject, secondSubject) => {
      const nameCompare = (firstSubject.name ?? "").localeCompare(
        secondSubject.name ?? "",
        undefined,
        { sensitivity: "base", numeric: true },
      );
      if (nameCompare !== 0) return nameCompare;
      return (firstSubject.id ?? "").localeCompare(secondSubject.id ?? "");
    });
  }, []);

  // Helper to sort semesters chronologically and subjects deterministically.
  const sortSemesters = useCallback(
    (semesters: Semester[]) => {
      const extractNumericPart = (value: string): number => {
        const match = value.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };

      return [...semesters]
        .map((semester) => ({
          ...semester,
          subjects: sortSubjects(semester.subjects ?? []),
        }))
        .sort((firstSemester, secondSemester) => {
          const firstYear = extractNumericPart(firstSemester.year);
          const secondYear = extractNumericPart(secondSemester.year);
          if (firstYear !== secondYear) return secondYear - firstYear;
          const firstSemesterNum = extractNumericPart(firstSemester.semester);
          const secondSemesterNum = extractNumericPart(secondSemester.semester);
          return secondSemesterNum - firstSemesterNum;
        });
    },
    [sortSubjects],
  );

  // Wrapped setter that sorts
  const setSemesters = useCallback(
    (value: Semester[] | ((prev: Semester[]) => Semester[])) => {
      setSemestersState((currentSemesters) => {
        const newValue =
          value instanceof Function ? value(currentSemesters) : value;
        return sortSemesters(newValue);
      });
    },
    [sortSemesters],
  );

  // Migration effect
  useEffect(() => {
    setSemestersState((currentSemesters) => {
      let needsUpdate = false;
      const migrated = currentSemesters.map((semester) => ({
        ...semester,
        subjects: semester.subjects.map((subject) => {
          if (subject.isGpa === undefined) {
            needsUpdate = true;
            return { ...subject, isGpa: true };
          }
          return subject;
        }),
      }));
      if (needsUpdate) {
        return sortSemesters(migrated);
      }
      return sortSemesters(currentSemesters);
    });
  }, [sortSemesters]); // Run once on mount

  const hydrateFromBackend = useCallback(async () => {
    const loadToken = ++loadTokenRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const [backendState, legacyState] = await Promise.all([
        gpaCalculatorApi.loadGpaState(studentId),
        Promise.resolve(readLegacyGpaState()),
      ]);

      if (loadToken !== loadTokenRef.current) {
        return;
      }

      const backendHasData =
        backendState.semesters.length > 0 ||
        !isDefaultSettings(backendState.settings);

      if (backendHasData) {
        setSemestersState(sortSemesters(backendState.semesters));
        setSettingsState(backendState.settings);
        clearLegacyGpaStorage();
      } else if (
        legacyState &&
        (legacyState.semesters.length > 0 ||
          !isDefaultSettings(legacyState.settings))
      ) {
        // Per-item migration: backend issues real UUIDs, which we keep in
        // local state. Settings go first so backend-derived defaults are
        // overwritten before any subject create depends on them.
        await gpaCalculatorApi.updateSettings(studentId, legacyState.settings);

        const migratedSemesters: Semester[] = [];
        for (const legacySem of sortSemesters(legacyState.semesters)) {
          const createdSem = await gpaCalculatorApi.createSemester(
            legacySem.year,
            legacySem.semester,
            studentId,
          );
          if (!createdSem) {
            throw new Error(
              "Failed to migrate legacy GPA semester to the backend.",
            );
          }
          const createdSubjects: Subject[] = [];
          for (const legacySubject of legacySem.subjects) {
            const createdSubject = await gpaCalculatorApi.createSubject(
              { ...legacySubject, id: "" } as Subject,
              createdSem.id,
              studentId,
            );
            if (!createdSubject) {
              throw new Error(
                "Failed to migrate legacy GPA subject to the backend.",
              );
            }
            createdSubjects.push(createdSubject);
          }
          migratedSemesters.push({ ...createdSem, subjects: createdSubjects });
        }

        setSemestersState(sortSemesters(migratedSemesters));
        setSettingsState(legacyState.settings);
        clearLegacyGpaStorage();
      } else {
        setSemestersState([]);
        setSettingsState(backendState.settings ?? defaultSettings);
      }

      hasHydratedFromBackend.current = true;
    } catch (hydrateError) {
      console.error("Failed to hydrate GPA data from backend:", hydrateError);
      const legacyState = readLegacyGpaState();
      if (
        legacyState &&
        (legacyState.semesters.length > 0 ||
          !isDefaultSettings(legacyState.settings))
      ) {
        setSemestersState(sortSemesters(legacyState.semesters));
        setSettingsState(legacyState.settings);
      } else {
        setSemestersState([]);
        setSettingsState(defaultSettings);
      }

      setError(
        hydrateError instanceof Error
          ? hydrateError.message
          : "Failed to load GPA data from backend.",
      );
      hasHydratedFromBackend.current = true;
    } finally {
      if (loadToken === loadTokenRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    clearLegacyGpaStorage,
    isDefaultSettings,
    readLegacyGpaState,
    sortSemesters,
    studentId,
  ]);

  const reload = useCallback(() => {
    void hydrateFromBackend();
  }, [hydrateFromBackend]);

  // Backend hydration effect - runs once on mount
  useEffect(() => {
    void hydrateFromBackend();
  }, [hydrateFromBackend]);

  // Mutations now persist via per-action API calls (see addSemester / addSubject /
  // updateSemester / updateSubject / deleteSemester / deleteSubject / updateSettings
  // below). The previous broad debounced sync that pushed the entire state graph
  // on every change has been removed — it created duplicate backend rows because
  // local Date.now() ids never matched persisted UUIDs.

  useEffect(() => {
    setSettingsState((currentSettings) => {
      if (currentSettings.gpaScale === undefined) {
        const gpaScale = currentSettings.gradingMode === "extended" ? 4.2 : 4.0;
        return { ...currentSettings, gpaScale };
      }
      return currentSettings;
    });
  }, []);

  const addSemester = useCallback(
    async (year: string, semester: string): Promise<Semester | null> => {
      const created = await gpaCalculatorApi.createSemester(
        year,
        semester,
        studentId,
      );
      if (!created) {
        setError("Failed to create semester. Please try again.");
        return null;
      }
      setError(null);
      const normalized: Semester = {
        ...created,
        subjects: created.subjects ?? [],
      };
      setSemesters((prev) => [...prev, normalized]);
      return normalized;
    },
    [setSemesters, studentId],
  );

  const updateSemester = useCallback(
    async (
      id: string,
      updates: Partial<Semester>,
    ): Promise<Semester | null> => {
      const current = semesters.find((sem) => sem.id === id);
      if (!current) return null;
      const merged: Semester = { ...current, ...updates };
      const updated = await gpaCalculatorApi.updateSemester(merged, studentId);
      if (!updated) {
        setError("Failed to update semester. Please try again.");
        return null;
      }
      setError(null);
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === id
            ? { ...sem, year: updated.year, semester: updated.semester }
            : sem,
        ),
      );
      return updated;
    },
    [semesters, setSemesters, studentId],
  );

  const deleteSemester = useCallback(
    async (id: string): Promise<boolean> => {
      const ok = await gpaCalculatorApi.deleteSemester(id);
      if (!ok) {
        setError("Failed to delete semester. Please try again.");
        return false;
      }
      setError(null);
      setSemesters((prev) => prev.filter((sem) => sem.id !== id));
      return true;
    },
    [setSemesters],
  );

  const addSubject = useCallback(
    async (
      semesterId: string,
      subject: Omit<Subject, "id">,
    ): Promise<ValidationResult<Subject>> => {
      const gpaScale = getEffectiveGpaScale(settings);
      const validation = validateSubjectForSemester(
        subject,
        getExistingSubjectNames(semesterId),
        gpaScale,
      );
      if (!validation.ok) {
        return validation;
      }

      // Backend assigns the real id; pass empty so the server doesn't try to merge.
      const draft: Subject = { ...validation.value, id: "" } as Subject;
      const created = await gpaCalculatorApi.createSubject(
        draft,
        semesterId,
        studentId,
      );
      if (!created) {
        return {
          ok: false,
          errors: { general: "Failed to save subject. Please try again." },
        };
      }

      setError(null);
      setSemesters((prev) =>
        prev.map((semester) =>
          semester.id === semesterId
            ? {
                ...semester,
                subjects: sortSubjects([...semester.subjects, created]),
              }
            : semester,
        ),
      );
      return { ok: true, value: created };
    },
    [getExistingSubjectNames, setSemesters, settings, sortSubjects, studentId],
  );

  const updateSubject = useCallback(
    async (
      semesterId: string,
      subjectId: string,
      updates: Partial<Subject>,
    ): Promise<ValidationResult<Subject>> => {
      const semester = semesters.find((item) => item.id === semesterId);
      const currentSubject = semester?.subjects.find(
        (item) => item.id === subjectId,
      );
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

      const merged: Subject = { ...currentSubject, ...validation.value };
      const updated = await gpaCalculatorApi.updateSubject(merged, studentId);
      if (!updated) {
        return {
          ok: false,
          errors: { general: "Failed to update subject. Please try again." },
        };
      }

      setError(null);
      setSemesters((prev) =>
        prev.map((semesterItem) =>
          semesterItem.id === semesterId
            ? {
                ...semesterItem,
                subjects: sortSubjects(
                  semesterItem.subjects.map((subjectItem) =>
                    subjectItem.id === subjectId ? updated : subjectItem,
                  ),
                ),
              }
            : semesterItem,
        ),
      );
      return { ok: true, value: updated };
    },
    [
      getExistingSubjectNames,
      semesters,
      setSemesters,
      settings,
      sortSubjects,
      studentId,
    ],
  );

  const deleteSubject = useCallback(
    async (semesterId: string, subjectId: string): Promise<boolean> => {
      const ok = await gpaCalculatorApi.deleteSubject(subjectId);
      if (!ok) {
        setError("Failed to delete subject. Please try again.");
        return false;
      }
      setError(null);
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === semesterId
            ? {
                ...sem,
                subjects: sem.subjects.filter((sub) => sub.id !== subjectId),
              }
            : sem,
        ),
      );
      return true;
    },
    [setSemesters],
  );

  const getCgpa = useCallback(() => {
    const gpaScale = getEffectiveGpaScale(settings);
    return calculateCgpa(semesters, gpaScale);
  }, [semesters, settings]);

  const getSemesterGpa = useCallback(
    (semesterId: string) => {
      const semester = semesters.find((s) => s.id === semesterId);
      const gpaScale = getEffectiveGpaScale(settings);
      return semester ? calculateSemesterGpa(semester.subjects, gpaScale) : 0;
    },
    [semesters, settings],
  );

  const getTotalCredits = useCallback(() => {
    return semesters.reduce(
      (total, sem) =>
        total +
        sem.subjects.reduce((semTotal, sub) => semTotal + sub.credits, 0),
      0,
    );
  }, [semesters]);

  const getGpaCredits = useCallback(() => {
    return semesters.reduce(
      (total, sem) =>
        total +
        sem.subjects.reduce(
          (semTotal, sub) => semTotal + (sub.isGpa !== false ? sub.credits : 0),
          0,
        ),
      0,
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

  const updateSettings = useCallback(
    async (newSettings: Partial<GpaSettings>): Promise<boolean> => {
      const gpaScale =
        newSettings.gpaScale ??
        (newSettings.gradingMode === "extended"
          ? 4.2
          : newSettings.gradingMode === "standard"
            ? 4.0
            : settings.gpaScale);
      const gradingMode =
        newSettings.gradingMode ?? (gpaScale === 4.2 ? "extended" : "standard");

      const merged: GpaSettings = {
        ...settings,
        ...newSettings,
        gpaScale,
        gradingMode,
      };

      // Persist settings change first; only mutate local state if the backend
      // accepts. If the user already has subjects with grades that need
      // re-normalising for the new scale, those persist via subject updates
      // below.
      const persisted = await gpaCalculatorApi.updateSettings(
        studentId,
        merged,
      );
      if (!persisted) {
        setError("Failed to update GPA settings. Please try again.");
        return false;
      }

      setError(null);
      setSettingsState(merged);

      // Re-grade subjects locally for the new scale.
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

      return true;
    },
    [
      setSemesters,
      setSettingsState,
      setSimulationSubjects,
      settings,
      studentId,
    ],
  );

  // Projection tool
  const addProjectionSubject = useCallback(
    (subject: Omit<ProjectionSubject, "id">) => {
      const newSubject: ProjectionSubject = {
        ...subject,
        id: Date.now().toString(),
      };
      const newSubjects = [...projection.subjects, newSubject];
      const projectedGpa = calculateSemesterGpa(
        newSubjects,
        getEffectiveGpaScale(settings),
      );
      setProjection({ subjects: newSubjects, projectedGpa });
    },
    [projection.subjects, settings],
  );

  const updateProjectionSubject = useCallback(
    (id: string, updates: Partial<ProjectionSubject>) => {
      const newSubjects = projection.subjects.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub,
      );
      const projectedGpa = calculateSemesterGpa(
        newSubjects,
        getEffectiveGpaScale(settings),
      );
      setProjection({ subjects: newSubjects, projectedGpa });
    },
    [projection.subjects, settings],
  );

  const deleteProjectionSubject = useCallback(
    (id: string) => {
      const newSubjects = projection.subjects.filter((sub) => sub.id !== id);
      const projectedGpa = calculateSemesterGpa(
        newSubjects,
        getEffectiveGpaScale(settings),
      );
      setProjection({ subjects: newSubjects, projectedGpa });
    },
    [projection.subjects, settings],
  );

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
          ? normalizeGrade(
              subject.lockedGrade,
              getEffectiveGpaScale(settings),
            ) || undefined
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
          ? normalizeGrade(
              candidate.lockedGrade,
              getEffectiveGpaScale(settings),
            ) || undefined
          : undefined,
      };

      setSimulationSubjects(
        simulationSubjects.map((subject) =>
          subject.id === id ? nextSubject : subject,
        ),
      );
      return { ok: true, value: nextSubject };
    },
    [setSimulationSubjects, settings, simulationSubjects],
  );

  const deleteSimulationSubject = useCallback(
    (id: string) => {
      setSimulationSubjects(simulationSubjects.filter((sub) => sub.id !== id));
    },
    [simulationSubjects, setSimulationSubjects],
  );

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
      settings,
    );
  }, [semesters.length, getGpaCredits, getCgpa, settings]);

  const getInsightMessage = useCallback(() => {
    const prediction = getDegreePrediction();
    const currentCgpa = getCgpa();
    const remainingSemesters = GPA_CONFIG.TOTAL_SEMESTERS - semesters.length; // Use centralized constant instead of hardcoded 8
    return generateInsightMessage(
      prediction,
      currentCgpa,
      remainingSemesters,
      settings.degreeClasses,
    );
  }, [getDegreePrediction, getCgpa, semesters.length, settings.degreeClasses]);

  return {
    semesters,
    settings,
    isLoading,
    error,
    reload,
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

type GpaCalculatorApi = ReturnType<typeof useGpaCalculatorImpl>;

const GpaCalculatorContext = createContext<GpaCalculatorApi | null>(null);

/**
 * Provider that holds a single shared instance of the GPA calculator hook.
 *
 * Wrap any subtree that contains multiple GPA-aware components (e.g. the
 * authenticated app layout). Without this, every component that calls
 * `useGpaCalculator()` would get its own independent `useState`, so a
 * mutation in one component (like `SubjectForm.addSubject`) would not be
 * visible to siblings (like `SemesterManager`).
 */
export function GpaCalculatorProvider({ children }: { children: ReactNode }) {
  const value = useGpaCalculatorImpl();
  return (
    <GpaCalculatorContext.Provider value={value}>
      {children}
    </GpaCalculatorContext.Provider>
  );
}

export function useGpaCalculator(): GpaCalculatorApi {
  const ctx = useContext(GpaCalculatorContext);
  if (!ctx) {
    throw new Error(
      "useGpaCalculator must be used within a <GpaCalculatorProvider>",
    );
  }
  return ctx;
}
