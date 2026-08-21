const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayIsoDate = (): string => formatDateLocal(new Date());

export const isTodayOrFuture = (isoDate: string): boolean => {
  return Boolean(isoDate) && isoDate >= getTodayIsoDate();
};

/** A date is overdue once it falls strictly before today. */
export const isOverdue = (isoDate: string): boolean => {
  return Boolean(isoDate) && isoDate < getTodayIsoDate();
};