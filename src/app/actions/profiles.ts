"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import dayjs from "@/lib/date";
import type { ActionResult } from "@/components/feedback/form-result";

export async function updateProfileAction(input: any): Promise<ActionResult> {
  try {
    const payload = profileSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);
    const session = await auth();
    const user = requireUser(session);

    const profile = await prisma.employeeProfile.upsert({
      where: { userId: user.id },
      update: {
        vorname: payload.vorname,
        nachname: payload.nachname,
        adresse: payload.adresse,
        telefon: payload.telefon,
        geburtstag: payload.geburtstag ? dayjs(payload.geburtstag).toDate() : null,
        bankIban: payload.bankIban ? payload.bankIban.trim() : null,
        steuerId: payload.steuerId ? payload.steuerId.trim() : null,
        notizen: payload.notizen ? payload.notizen.trim() : null
      },
      create: {
        userId: user.id,
        vorname: payload.vorname,
        nachname: payload.nachname,
        adresse: payload.adresse,
        telefon: payload.telefon,
        geburtstag: payload.geburtstag ? dayjs(payload.geburtstag).toDate() : null,
        bankIban: payload.bankIban ? payload.bankIban.trim() : null,
        steuerId: payload.steuerId ? payload.steuerId.trim() : null,
        notizen: payload.notizen ? payload.notizen.trim() : null
      }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "EmployeeProfile",
      entityId: profile.id,
      action: "UPSERT"
    });

    revalidatePath("/profil");
    return { success: true, message: "Profil gespeichert" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Profil konnte nicht gespeichert werden" };
  }
}
