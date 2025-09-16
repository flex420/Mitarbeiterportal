import { describe, expect, it } from \ vitest\;
import { shiftConflicts } from \@/lib/shifts\;

const shift = (id: string, start: string, end: string, userIds: string[]) => ({
  id,
  date: new Date(start),
  startTime: new Date(start),
  endTime: new Date(end),
  role: \\,
  note: null,
  createdAt: new Date(),
  assignments: userIds.map((userId) => ({ id: `${id}-${userId}`, shiftId: id, userId, createdAt: new Date() }))
});

describe(\shift conflicts\, () => {
  it(\flags overlapping shift assignments\, () => {
    const conflicts = shiftConflicts([shift(\1\, \2024-01-01T08:00\, \2024-01-01T16:00\, [\u1\])], [], {
      date: new Date(\2024-01-01\),
      startTime: new Date(\2024-01-01T09:00\),
      endTime: new Date(\2024-01-01T12:00\),
      userIds: [\u1\]
    });
    expect(conflicts.length).toBe(1);
  });

  it(\flags vacation conflicts\, () => {
    const vacations = [{
      id: \v1\,
      userId: \u2\,
      startDate: new Date(\2024-01-02\),
      endDate: new Date(\2024-01-03\),
      type: \URLAUB\ as const,
      status: \OFFEN\ as const,
      comment: null,
      createdAt: new Date()
    }];
    const conflicts = shiftConflicts([], vacations as any, {
      date: new Date(\2024-01-02\),
      startTime: new Date(\2024-01-02T08:00\),
      endTime: new Date(\2024-01-02T16:00\),
      userIds: [\u2\]
    });
    expect(conflicts[0]).toContain(\Urlaubskonflikt\);
  });
});
