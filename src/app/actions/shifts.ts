"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { shiftCreateSchema, shiftAssignSchema } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { shiftConflicts } from "@/lib/shifts";
import dayjs from "@/lib/date";
import type { ActionResult } from "@/components/feedback/form-result";

export async function createShiftAction(input: any): Promise<ActionResult> {
  try {
    const payload = shiftCreateSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);

    const session = await auth();
    const user = requireUser(session);
    if (user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }

    const startTime = dayjs(`${payload.date}T${payload.startTime}`).toDate();
    const endTime = dayjs(`${payload.date}T${payload.endTime}`).toDate();

    const existingShifts = await prisma.shift.findMany({
      include: { assignments: true }
    });
    const vacations = await prisma.vacation.findMany({});

    const conflicts = shiftConflicts(existingShifts, vacations, {
      date: dayjs(payload.date).toDate(),
      startTime,
      endTime,
      userIds: payload.userIds ?? []
    });
    if (conflicts.length > 0) {
      return { success: false, error: conflicts.join(", ") };
    }

    const shift = await prisma.shift.create({
      data: {
        date: dayjs(payload.date).startOf("day").toDate(),
        startTime,
        endTime,
        role: payload.role?.trim() || null,
        note: payload.note?.trim() || null,
        assignments: {
          createMany: {
            data: (payload.userIds ?? []).map((userId) => ({ userId }))
          }
        }
      },
      include: { assignments: true }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "Shift",
      entityId: shift.id,
      action: "CREATE",
      diff: { assignments: payload.userIds }
    });

    revalidatePath("/dienstplan");
    return { success: true, message: "Schicht angelegt" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Schicht konnte nicht angelegt werden" };
  }
}

export async function assignShiftAction(input: any): Promise<ActionResult> {
  try {
    const payload = shiftAssignSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);
    const session = await auth();
    const user = requireUser(session);
    if (user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }

    const shift = await prisma.shift.findUnique({
      where: { id: payload.shiftId },
      include: { assignments: true }
    });
    if (!shift) {
      return { success: false, error: "Schicht nicht gefunden" };
    }

    const vacations = await prisma.vacation.findMany({ where: { userId: payload.userId } });
    const conflicts = shiftConflicts([shift as any], vacations, {
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userIds: [payload.userId]
    });
    if (conflicts.length > 0) {
      return { success: false, error: conflicts.join(", ") };
    }

    await prisma.shiftAssignment.create({
      data: { shiftId: payload.shiftId, userId: payload.userId }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "Shift",
      entityId: payload.shiftId,
      action: "ASSIGN",
      diff: { userId: payload.userId }
    });

    revalidatePath("/dienstplan");
    return { success: true, message: "Zugewiesen" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Zuweisung fehlgeschlagen" };
  }
}

export async function removeShiftAssignmentAction(input: any): Promise<ActionResult> {
  try {
    const payload = shiftAssignSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);

    const session = await auth();
    const user = requireUser(session);
    if (user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }

    await prisma.shiftAssignment.deleteMany({
      where: { shiftId: payload.shiftId, userId: payload.userId }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "Shift",
      entityId: payload.shiftId,
      action: "UNASSIGN",
      diff: { userId: payload.userId }
    });

    revalidatePath("/dienstplan");
    return { success: true, message: "Entfernt" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Entfernen fehlgeschlagen" };
  }
}
