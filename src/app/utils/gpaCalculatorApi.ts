/**
 * GPA Calculator API Client
 * Handles all communication with the backend GPA service
 */

import { Semester, Subject, GpaSettings } from "../components/gpa-calculator/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const GPA_API_BASE = `${BACKEND_URL}/api/gpa`;

export interface GpaBackendState {
  semesters: Semester[];
  settings: GpaSettings;
}

/**
 * Convert backend GPASemester DTO to frontend Semester type
 */
function fromBackendSemester(data: any): Semester {
  return {
    id: data.id,
    year: data.year,
    semester: data.semester,
    subjects: (data.subjects || []).map(fromBackendSubject),
  };
}

/**
 * Convert frontend Semester type to backend GPASemester DTO
 */
function toBackendSemester(semester: Semester, studentId: string): any {
  return {
    id: semester.id,
    year: semester.year,
    semester: semester.semester,
    studentId: studentId,
    subjects: semester.subjects.map((s) => toBackendSubject(s, studentId)),
  };
}

/**
 * Convert backend GPASubject DTO to frontend Subject type
 */
function fromBackendSubject(data: any): Subject {
  return {
    id: data.id,
    name: data.name,
    credits: data.credits,
    grade: data.grade,
    isGpa: data.isGpa ?? true,
  };
}

/**
 * Convert frontend Subject type to backend GPASubject DTO
 */
function toBackendSubject(subject: Subject, studentId: string, semesterId?: string): any {
  return {
    id: subject.id,
    name: subject.name,
    credits: subject.credits,
    grade: subject.grade,
    isGpa: subject.isGpa,
    studentId: studentId,
    semesterId: semesterId,
  };
}

/**
 * Convert backend GpaSettings DTO to frontend GpaSettings type
 */
function fromBackendSettings(data: any): GpaSettings {
  return {
    gradingMode: data.gradingMode === "EXTENDED_4_2" ? "extended" : "standard",
    gpaScale: data.gpaScale === "EXTENDED_4_2" ? 4.2 : 4.0,
    degreeClasses: {
      firstClass: data.firstClassThreshold,
      secondUpper: data.secondUpperThreshold,
      secondLower: data.secondLowerThreshold,
      general: data.generalThreshold,
    },
  };
}

/**
 * Convert frontend GpaSettings type to backend GpaSettings DTO
 */
function toBackendSettings(settings: GpaSettings, studentId: string): any {
  return {
    studentId: studentId,
    gradingMode: settings.gradingMode === "extended" ? "EXTENDED_4_2" : "STANDARD_4_0",
    gpaScale: settings.gpaScale === 4.2 ? "EXTENDED_4_2" : "STANDARD_4_0",
    firstClassThreshold: settings.degreeClasses.firstClass,
    secondUpperThreshold: settings.degreeClasses.secondUpper,
    secondLowerThreshold: settings.degreeClasses.secondLower,
    generalThreshold: settings.degreeClasses.general,
  };
}

/**
 * API: Get all semesters for a student
 */
export async function getSemestersByStudent(studentId: string): Promise<Semester[]> {
  const response = await fetch(`${GPA_API_BASE}/semesters/${studentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GPA semesters (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(fromBackendSemester) : [];
}

/**
 * API: Get a specific semester with subjects
 */
export async function getSemesterDetails(semesterId: string): Promise<Semester | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/semesters/${semesterId}/details`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSemester(data);
  } catch (error) {
    console.error("Error fetching semester details:", error);
    return null;
  }
}

/**
 * API: Create a new semester
 */
export async function createSemester(
  year: string,
  semester: string,
  studentId: string
): Promise<Semester | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/semesters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year,
        semester,
        studentId,
        subjects: [],
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSemester(data);
  } catch (error) {
    console.error("Error creating semester:", error);
    return null;
  }
}

/**
 * API: Update a semester
 */
export async function updateSemester(semester: Semester, studentId: string): Promise<Semester | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/semesters/${semester.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: semester.year,
        semester: semester.semester,
        studentId,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSemester(data);
  } catch (error) {
    console.error("Error updating semester:", error);
    return null;
  }
}

/**
 * API: Delete a semester
 */
export async function deleteSemester(semesterId: string): Promise<boolean> {
  try {
    const response = await fetch(`${GPA_API_BASE}/semesters/${semesterId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting semester:", error);
    return false;
  }
}

/**
 * API: Create a new subject in a semester
 */
export async function createSubject(
  subject: Subject,
  semesterId: string,
  studentId: string
): Promise<Subject | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...toBackendSubject(subject, studentId, semesterId),
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSubject(data);
  } catch (error) {
    console.error("Error creating subject:", error);
    return null;
  }
}

/**
 * API: Get subjects for a semester
 */
export async function getSubjectsBySemester(semesterId: string): Promise<Subject[]> {
  try {
    const response = await fetch(`${GPA_API_BASE}/semesters/${semesterId}/subjects`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(fromBackendSubject) : [];
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
}

/**
 * API: Update a subject
 */
export async function updateSubject(
  subject: Subject,
  studentId: string
): Promise<Subject | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/subjects/${subject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: subject.name,
        credits: subject.credits,
        grade: subject.grade,
        isGpa: subject.isGpa,
        studentId,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSubject(data);
  } catch (error) {
    console.error("Error updating subject:", error);
    return null;
  }
}

/**
 * API: Delete a subject
 */
export async function deleteSubject(subjectId: string): Promise<boolean> {
  try {
    const response = await fetch(`${GPA_API_BASE}/subjects/${subjectId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting subject:", error);
    return false;
  }
}

/**
 * API: Get GPA settings for a student
 */
export async function getSettings(studentId: string): Promise<GpaSettings> {
  const response = await fetch(`${GPA_API_BASE}/settings/${studentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GPA settings (HTTP ${response.status})`);
  }

  const data = await response.json();
  return fromBackendSettings(data);
}

/**
 * API: Update GPA settings
 */
export async function updateSettings(
  studentId: string,
  settings: GpaSettings
): Promise<GpaSettings | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/settings/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toBackendSettings(settings, studentId)),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSettings(data);
  } catch (error) {
    console.error("Error updating settings:", error);
    return null;
  }
}

/**
 * API: Calculate SGPA for a semester
 */
export async function calculateSGPA(semesterId: string): Promise<number> {
  try {
    const response = await fetch(`${GPA_API_BASE}/analytics/sgpa/${semesterId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.sgpa || 0;
  } catch (error) {
    console.error("Error calculating SGPA:", error);
    return 0;
  }
}

/**
 * API: Calculate CGPA for a student
 */
export async function calculateCGPA(studentId: string): Promise<number> {
  try {
    const response = await fetch(`${GPA_API_BASE}/analytics/cgpa/${studentId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.cgpa || 0;
  } catch (error) {
    console.error("Error calculating CGPA:", error);
    return 0;
  }
}

/**
 * API: Get degree class classification
 */
export async function getDegreeClass(studentId: string): Promise<{
  degreeClass: string;
  cgpa: string;
} | null> {
  try {
    const response = await fetch(`${GPA_API_BASE}/analytics/degree-class/${studentId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching degree class:", error);
    return null;
  }
}

/**
 * API: Calculate required SGPA to reach a target CGPA
 */
export async function calculateRequiredSGPA(
  studentId: string,
  targetCgpa: number,
  nextSemesterCredits: number = 18.0
): Promise<number> {
  try {
    const response = await fetch(
      `${GPA_API_BASE}/analytics/required-sgpa?studentId=${studentId}&targetCgpa=${targetCgpa}&nextSemesterCredits=${nextSemesterCredits}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.requiredSgpa || 0;
  } catch (error) {
    console.error("Error calculating required SGPA:", error);
    return 0;
  }
}

/**
 * API: Predict probability of achieving a target degree class
 */
export async function predictDegreeClassProbability(
  studentId: string,
  targetDegreeClass: string,
  nextSemesterSubjectCredits: number[],
  simulations: number = 1000
): Promise<number> {
  try {
    const response = await fetch(
      `${GPA_API_BASE}/analytics/prediction?studentId=${studentId}&targetDegreeClass=${targetDegreeClass}&simulations=${simulations}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSemesterSubjectCredits),
      }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.probability || 0;
  } catch (error) {
    console.error("Error predicting degree class probability:", error);
    return 0;
  }
}

/**
 * Sync all GPA data to backend
 * Pushes all semesters and subjects for a student to the backend
 */
export async function syncAllGPAData(
  semesters: Semester[],
  settings: GpaSettings,
  studentId: string
): Promise<boolean> {
  try {
    // Sync settings first
    await updateSettings(studentId, settings);

    // Sync each semester and its subjects
    for (const semester of semesters) {
      const existing = await getSemesterDetails(semester.id);
      if (!existing) {
        // Create new semester
        const created = await createSemester(semester.year, semester.semester, studentId);
        if (!created) return false;

        // Create subjects
        for (const subject of semester.subjects) {
          const created_subject = await createSubject(subject, created.id, studentId);
          if (!created_subject) return false;
        }
      } else {
        // Update existing semester and subjects
        await updateSemester(semester, studentId);
        
        // Sync subjects
        for (const subject of semester.subjects) {
          if (subject.id) {
            await updateSubject(subject, studentId);
          } else {
            const created_subject = await createSubject(subject, semester.id, studentId);
            if (!created_subject) return false;
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error syncing GPA data:", error);
    return false;
  }
}

/**
 * Load the full GPA state from the backend.
 */
export async function loadGpaState(studentId: string): Promise<GpaBackendState> {
  const [semesters, settings] = await Promise.all([
    getSemestersByStudent(studentId),
    getSettings(studentId),
  ]);

  return {
    semesters,
    settings,
  };
}
