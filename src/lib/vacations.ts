import dayjs from "@/lib/date";
import type { Vacation } from "@prisma/client";

export function overlapsVacation(vacations: Vacation[], startDate: Date, endDate: Date): boolean {
  return vacations.some((vac) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const vacStart = dayjs(vac.startDate);
    const vacEnd = dayjs(vac.endDate);
    return vacStart.isBefore(end) && vacEnd.isAfter(start.subtract(1, "millisecond"));
  });
}
