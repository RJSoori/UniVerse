export type PlannerGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "E"
  | "F";

export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: PlannerGrade;
  isGpa: boolean;
}

export interface Semester {
  id: string;
  year: string;
  semester: string;
  subjects: Subject[];
}

export interface GpaSettings {
  gradingMode: "standard" | "extended";
  gpaScale: 4.0 | 4.2;
  degreeClasses: {
    firstClass: number;
    secondUpper: number;
    secondLower: number;
    general: number;
  };
}

export interface GpaData {
  semesters: Semester[];
  settings: GpaSettings;
}

export interface PlannerSubject {
  id: string;
  name: string;
  credits: number;
  grade: PlannerGrade;
  category: string;
  lockedGrade?: PlannerGrade;
}

export interface DegreeClassPrediction {
  firstClass: number;
  secondUpper: number;
  secondLower: number;
  general: number;
}

export interface ProjectionSubject {
  id: string;
  name: string;
  credits: number;
  grade: PlannerGrade;
  isGpa?: boolean;
}

export interface GpaProjection {
  subjects: ProjectionSubject[];
  projectedGpa: number;
}
