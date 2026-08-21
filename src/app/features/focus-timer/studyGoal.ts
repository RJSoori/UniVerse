export const STUDY_TARGET_GPA = 3.8;

// Recommended daily study minutes to close the gap toward the target GPA.
// Shared by the Focus Timer's "GPA Focus Goal" card and the dashboard's study-goal tile.
export function getSuggestedStudyMinutes(currentCgpa: number, targetGpa: number = STUDY_TARGET_GPA): number {
  const gpaGap = Math.max(0, targetGpa - currentCgpa);
  const hours = gpaGap > 0 ? 2 + gpaGap * 4 : 2;
  return hours * 60;
}

export function formatStudyMinutes(mins: number): string {
  if (mins <= 0) return "0m";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
