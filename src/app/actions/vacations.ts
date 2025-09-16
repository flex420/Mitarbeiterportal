"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vacationCreateSchema, vacationUpdateSchema } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { allowVacationOverlap } from "@/lib/config";
import { overlapsVacation } from "@/lib/vacations";
import { logAudit } from "@/lib/audit";
import dayjs from "@/lib/date";
import type { ActionResult } from "@/components/feedback/form-result";
import { VacationStatus } from "@prisma/client";

const statusMap: Record<string, VacationStatus> = {
  offen: VacationStatus.OFFEN,
  genehmigt: VacationStatus.GENEHMIGT,
  gesperrt: VacationStatus.GESPERRT
};

export async function createVacationAction(input: any): Promise<ActionResult> {
  try {
    const payload = vacationCreateSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);

    const session = await auth();
    const user = requireUser(session);

    const startDate = dayjs(payload.startDate).startOf("day").toDate();
    const endDate = dayjs(payload.endDate).endOf("day").toDate();

    if (!allowVacationOverlap()) {
      const existing = await prisma.vacation.findMany({ where: { userId: user.id } });
      if (overlapsVacation(existing, startDate, endDate)) {
        return { success: false, error: "Urlaub überschneidet sich mit bestehenden Terminen" };
      }
    }

    const vacation = await prisma.vacation.create({
      data: {
        userId: user.id,
        startDate,
        endDate,
        type: payload.type === "sonder" ? "SONDER" : "URLAUB",
        status: VacationStatus.OFFEN,
        comment: payload.comment ?? null
      }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "Vacation",
      entityId: vacation.id,
      action: "CREATE",
      diff: { startDate, endDate, type: vacation.type }
    });

    revalidatePath("/urlaubskalender");
    return { success: true, message: "Urlaub angelegt" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Urlaub konnte nicht angelegt werden" };
  }
}

export async function updateVacationAction(input: any): Promise<ActionResult> {
  try {
    const payload = vacationUpdateSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);

    const session = await auth();
    const user = requireUser(session);

    const vacation = await prisma.vacation.findUnique({ where: { id: payload.id } });
    if (!vacation) {
      return { success: false, error: "Urlaub nicht gefunden" };
    }
    if (vacation.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }
    if (vacation.status === VacationStatus.GESPERRT && user.role !== "ADMIN") {
      return { success: false, error: "Eintrag gesperrt" };
    }

    const startDate = dayjs(payload.startDate).startOf("day").toDate();
    const endDate = dayjs(payload.endDate).endOf("day").toDate();

    if (!allowVacationOverlap()) {
      const existing = await prisma.vacation.findMany({
        where: { userId: vacation.userId, NOT: { id: vacation.id } }
      });
      if (overlapsVacation(existing, startDate, endDate)) {
        return { success: false, error: "Urlaub überschneidet sich" };
      }
    }

    await prisma.vacation.update({
      where: { id: vacation.id },
      data: {
        startDate,
        endDate,
        type: payload.type === "sonder" ? "SONDER" : "URLAUB",
        comment: payload.comment ?? null
      }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "Vacation",
      entityId: vacation.id,
      action: "UPDATE",
      diff: { startDate, endDate }
    });

    revalidatePath("/urlaubskalender");
    return { success: true, message: "Urlaub aktualisiert" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Update fehlgeschlagen" };
  }
}

export async function deleteVacationAction(input: { id: string; csrfToken: string }): Promise<ActionResult> {
  try {
    await verifyCsrfToken(input.csrfToken);
    const session = await auth();
    const user = requireUser(session);
    const vacation = await prisma.vacation.findUnique({ where: { id: input.id } });
    if (!vacation) {
      return { success: false, error: "Urlaub nicht gefunden" };
    }
    if (vacation.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }
    if (vacation.status === VacationStatus.GESPERRT && user.role !== "ADMIN") {
      return { success: false, error: "Eintrag gesperrt" };
    }

    await prisma.vacation.delete({ where: { id: input.id } });
    await logAudit({
      actorUserId: user.id,
      entityType: "Vacation",
      entityId: vacation.id,
      action: "DELETE"
    });

    revalidatePath("/urlaubskalender");
    return { success: true, message: "Urlaub gelöscht" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Löschen fehlgeschlagen" };
  }
}

export async function updateVacationStatusAction(input: { id: string; status: string; csrfToken: string }): Promise<ActionResult> {
  try {
    await verifyCsrfToken(input.csrfToken);
    const session = await auth();
    const user = requireUser(session);
    if (user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }

    const status = statusMap[input.status];
    if (!status) {
      return { success: false, error: "Ungültiger Status" };
    }

    const vacation = await prisma.vacation.update({
      where: { id: input.id },
      data: { status }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "Vacation",
      entityId: vacation.id,
      action: "STATUS",
      diff: { status }
    });

    revalidatePath("/urlaubskalender");
    return { success: true, message: "Status aktualisiert" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Statusänderung fehlgeschlagen" };
  }
}
