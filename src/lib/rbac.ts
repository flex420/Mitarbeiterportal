import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export function requireUser(session: Session | null): { id: string; role: string; username: string; name?: string | null } {
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export function requireAdmin(session: Session | null) {
  const user = requireUser(session);
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export function assertRole(user: { role: string }, allowed: string[]) {
  if (!allowed.includes(user.role)) {
    throw new Error("Keine Berechtigung");
  }
}

export function canAssignShifts(role: string) {
  return role === "ADMIN";
}

export function canManageUsers(role: string) {
  return role === "ADMIN";
}

export function canManageVacations(role: string) {
  return role === "ADMIN";
}
