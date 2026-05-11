import { Semester, Subject, GpaSettings } from "../types";
import { apiFetch } from "../../../shared/api/client";

const GPA_API_BASE = "/api/gpa";

interface GpaBackendState {
  semesters: Semester[];
  settings: GpaSettings;
}

function fromBackendSemester(data: any): Semester {
  return {
    id: data.id,
    year: data.year,
    semester: data.semester,
    subjects: (data.subjects || []).map(fromBackendSubject),
  };
}

const gradeToBackend = (grade: string) => {
  const map: Record<string, string> = {
    "A+": "PLUS_A",
    "A-": "MINUS_A",
    "B+": "PLUS_B",
    "B-": "MINUS_B",
    "C+": "PLUS_C",
    "C-": "MINUS_C",
    "D+": "PLUS_D",
  };
  return map[grade] ?? grade;
};

const normalizeBackendGrade = (grade: string) => {
  const map: Record<string, string> = {
    PLUS_A: "A+",
    MINUS_A: "A-",
    PLUS_B: "B+",
    MINUS_B: "B-",
    PLUS_C: "C+",
    MINUS_C: "C-",
    PLUS_D: "D+",
  };
  return map[grade] ?? grade;
};

function fromBackendSubject(data: any): Subject {
  return {
    id: data.id,
    name: data.name,
    credits: data.credits,
    grade: normalizeBackendGrade(data.grade),
    isGpa: data.isGpa ?? true,
  };
}

function toBackendSubject(subject: Subject, semesterId?: string): any {
  return {
    id: subject.id,
    name: subject.name,
    credits: subject.credits,
    grade: gradeToBackend(subject.grade),
    isGpa: subject.isGpa,
    semester: semesterId ? { id: semesterId } : undefined,
  };
}

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

function toBackendSettings(settings: GpaSettings): any {
  return {
    gradingMode: settings.gradingMode === "extended" ? "EXTENDED_4_2" : "STANDARD_4_0",
    gpaScale: settings.gpaScale === 4.2 ? "EXTENDED_4_2" : "STANDARD_4_0",
    firstClassThreshold: settings.degreeClasses.firstClass,
    secondUpperThreshold: settings.degreeClasses.secondUpper,
    secondLowerThreshold: settings.degreeClasses.secondLower,
    generalThreshold: settings.degreeClasses.general,
  };
}

async function getSemestersByStudent(_studentId?: string): Promise<Semester[]> {
  const response = await apiFetch(`${GPA_API_BASE}/semesters`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GPA semesters (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(fromBackendSemester) : [];
}

export async function createSemester(
  year: string,
  semester: string,
  _studentId?: string
): Promise<Semester | null> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/semesters`, {
      method: "POST",
      body: JSON.stringify({ year, semester, subjects: [] }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSemester(data);
  } catch (error) {
    console.error("Error creating semester:", error);
    return null;
  }
}

export async function updateSemester(semester: Semester, _studentId?: string): Promise<Semester | null> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/semesters/${semester.id}`, {
      method: "PUT",
      body: JSON.stringify({ year: semester.year, semester: semester.semester }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSemester(data);
  } catch (error) {
    console.error("Error updating semester:", error);
    return null;
  }
}

export async function deleteSemester(semesterId: string): Promise<boolean> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/semesters/${semesterId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting semester:", error);
    return false;
  }
}

export async function createSubject(
  subject: Subject,
  semesterId: string,
  _studentId?: string
): Promise<Subject | null> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/subjects`, {
      method: "POST",
      body: JSON.stringify(toBackendSubject(subject, semesterId)),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSubject(data);
  } catch (error) {
    console.error("Error creating subject:", error);
    return null;
  }
}

export async function updateSubject(
  subject: Subject,
  _studentId?: string
): Promise<Subject | null> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/subjects/${subject.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: subject.name,
        credits: subject.credits,
        grade: gradeToBackend(subject.grade),
        isGpa: subject.isGpa,
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

export async function deleteSubject(subjectId: string): Promise<boolean> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/subjects/${subjectId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting subject:", error);
    return false;
  }
}

async function getSettings(_studentId?: string): Promise<GpaSettings> {
  const response = await apiFetch(`${GPA_API_BASE}/settings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GPA settings (HTTP ${response.status})`);
  }
  const data = await response.json();
  return fromBackendSettings(data);
}

export async function updateSettings(
  _studentId: string,
  settings: GpaSettings
): Promise<GpaSettings | null> {
  try {
    const response = await apiFetch(`${GPA_API_BASE}/settings`, {
      method: "PUT",
      body: JSON.stringify(toBackendSettings(settings)),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return fromBackendSettings(data);
  } catch (error) {
    console.error("Error updating settings:", error);
    return null;
  }
}

export async function loadGpaState(studentId: string): Promise<GpaBackendState> {
  const [semesters, settings] = await Promise.all([
    getSemestersByStudent(studentId),
    getSettings(studentId),
  ]);
  return { semesters, settings };
}
