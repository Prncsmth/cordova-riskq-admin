export const DATE_RANGES = ["Today", "This Week", "This Month", "This Year"] as const;
export type DateRangePreset = (typeof DATE_RANGES)[number];

export function getRangeBounds(preset: DateRangePreset): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  switch (preset) {
    case "Today":
      break;
    case "This Week": {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      break;
    }
    case "This Month":
      startDate.setDate(1);
      break;
    case "This Year":
      startDate.setMonth(0, 1);
      break;
  }

  return { startDate, endDate };
}
