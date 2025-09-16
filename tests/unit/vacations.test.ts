import { describe, expect, it } from \ vitest\;
import { overlapsVacation } from \@/lib/vacations\;

const vacation = (id: string, start: string, end: string) => ({
  id,
  userId: \user\,
  startDate: new Date(start),
  endDate: new Date(end),
  type: \URLAUB\ as const,
  status: \OFFEN\ as const,
  comment: null,
  createdAt: new Date()
});

describe(\vacation overlap\, () => {
  it(\detects overlapping periods\, () => {
    const vacations = [vacation(\1\, \2024-01-10\, \2024-01-15\)];
    expect(overlapsVacation(vacations as any, new Date(\2024-01-12\), new Date(\2024-01-14\))).toBe(true);
  });

  it(\allows non-overlapping periods\, () => {
    const vacations = [vacation(\1\, \2024-01-10\, \2024-01-15\)];
    expect(overlapsVacation(vacations as any, new Date(\2024-02-01\), new Date(\2024-02-05\))).toBe(false);
  });
});
