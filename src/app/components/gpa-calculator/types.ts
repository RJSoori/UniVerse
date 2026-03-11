export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Semester {
  id: string;
  year: string;
  semester: string;
  subjects: Subject[];
}

export interface GpaSettings {
  gradingMode: "standard" | "extended";
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
  grade: string;
}

export interface GpaProjection {
  subjects: ProjectionSubject[];
  projectedGpa: number;
}