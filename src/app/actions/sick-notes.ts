"use server";

import { prisma } from "@/lib/prisma";
import { downloadTokenSchema } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { getDownloadTtlMinutes } from "@/lib/config";
import { nanoid } from "nanoid";
import dayjs from "@/lib/date";
import type { ActionResult } from "@/components/feedback/form-result";

export async function createDownloadTokenAction(input: any): Promise<ActionResult> {
  try {
    const payload = downloadTokenSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);

    const session = await auth();
    const user = requireUser(session);

    const sickNote = await prisma.sickNote.findUnique({
      where: { id: payload.sickNoteId },
      include: { user: true }
    });
    if (!sickNote) {
      return { success: false, error: "Krankmeldung nicht gefunden" };
    }

    if (user.role !== "ADMIN" && sickNote.userId !== user.id) {
      return { success: false, error: "Keine Berechtigung" };
    }

    const token = nanoid();
    const ttlMinutes = getDownloadTtlMinutes();
    await prisma.downloadToken.create({
      data: {
        token,
        sickNoteId: sickNote.id,
        userId: user.id,
        expiresAt: dayjs().add(ttlMinutes, "minute").toDate()
      }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "SickNote",
      entityId: sickNote.id,
      action: "TOKEN",
      diff: { token }
    });

    return {
      success: true,
      message: "Download-Link erstellt",
      token
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Token konnte nicht erstellt werden" };
  }
}
