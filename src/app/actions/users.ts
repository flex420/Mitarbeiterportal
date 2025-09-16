"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { userRoleSchema } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/components/feedback/form-result";

export async function updateUserRoleAction(input: any): Promise<ActionResult> {
  try {
    const payload = userRoleSchema.parse(input);
    await verifyCsrfToken(payload.csrfToken);
    const session = await auth();
    const user = requireUser(session);
    if (user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" };
    }

    if (payload.userId === user.id) {
      return { success: false, error: "Eigene Rolle kann nicht geändert werden" };
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: { role: payload.role }
    });

    await logAudit({
      actorUserId: user.id,
      entityType: "User",
      entityId: updated.id,
      action: "ROLE",
      diff: { role: payload.role }
    });

    revalidatePath("/admin");
    return { success: true, message: "Rolle aktualisiert" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Rolle konnte nicht gesetzt werden" };
  }
}
