import { describe, expect, it } from \ vitest\;
import { canAssignShifts, canManageUsers, canManageVacations } from \@/lib/rbac\;

describe(\RBAC helpers\, () => {
  it(\allows admin to manage users\, () => {
    expect(canManageUsers(\ADMIN\)).toBe(true);
    expect(canManageUsers(\EMPLOYEE\)).toBe(false);
  });

  it(\allows only admins to assign shifts\, () => {
    expect(canAssignShifts(\ADMIN\)).toBe(true);
    expect(canAssignShifts(\EMPLOYEE\)).toBe(false);
  });

  it(\allows only admins to manage vacations\, () => {
    expect(canManageVacations(\ADMIN\)).toBe(true);
    expect(canManageVacations(\EMPLOYEE\)).toBe(false);
  });
});
