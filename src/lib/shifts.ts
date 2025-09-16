import dayjs from "@/lib/date";
import type { Shift, Vacation } from "@prisma/client";

export function shiftConflicts(
  existingShifts: Array<Shift & { assignments: { userId: string }[] }>,
  vacations: Vacation[],
  newShift: { date: Date; startTime: Date; endTime: Date; userIds: string[] }
) {
  const conflicts: string[] = [];
  for (const userId of newShift.userIds) {
    const overlappingShift = existingShifts.find((shift) => {
      return (
        shift.assignments.some((assign) => assign.userId === userId) &&
        dayjs(shift.startTime).isBefore(newShift.endTime) &&
        dayjs(shift.endTime).isAfter(newShift.startTime)
      );
    });
    if (overlappingShift) {
      conflicts.push(`Schichtkonflikt für Mitarbeiter ${userId}`);
      continue;
    }
    const overlappingVacation = vacations.find((vac) => {
      return (
        vac.userId === userId &&
        dayjs(vac.startDate).isBefore(newShift.endTime) &&
        dayjs(vac.endDate).isAfter(newShift.startTime)
      );
    });
    if (overlappingVacation) {
      conflicts.push(`Urlaubskonflikt für Mitarbeiter ${userId}`);
    }
  }
  return conflicts;
}
