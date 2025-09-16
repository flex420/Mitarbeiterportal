"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthLimiter } from "@/lib/rateLimit";
import { registerSchema, loginSchema } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { logAudit } from "@/lib/audit";
import { signIn } from "@/lib/auth";
import argon2 from "argon2";
import { Role } from "@prisma/client";
import type { ActionResult } from "@/components/feedback/form-result";

export async function registerAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const input = registerSchema.parse(raw);
    await verifyCsrfToken(input.csrfToken);

    const limiter = getAuthLimiter();
    const rate = limiter.consume(`register:${input.username}`);
    if (!rate.ok) {
      return { success: false, error: "Zu viele Versuche. Bitte später erneut versuchen." };
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const userCount = await tx.user.count();
      const role = userCount === 0 ? Role.ADMIN : Role.EMPLOYEE;
      const created = await tx.user.create({
        data: {
          username: input.username,
          role,
          passwordHash
        }
      });
      await logAudit({
        actorUserId: created.id,
        entityType: "User",
        entityId: created.id,
        action: "REGISTER",
        diff: { role }
      });
      return created;
    });

    await signIn("credentials", {
      redirect: false,
      username: input.username,
      password: input.password
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Registrierung fehlgeschlagen" };
  }
}

export async function loginAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const input = loginSchema.parse(raw);
    await verifyCsrfToken(input.csrfToken);

    const limiter = getAuthLimiter();
    const rate = limiter.consume(`login:${input.username}`);
    if (!rate.ok) {
      return { success: false, error: "Zu viele Versuche. Bitte warten." };
    }

    const res = await signIn("credentials", {
      redirect: false,
      username: input.username,
      password: input.password
    });

    if (res?.error) {
      return { success: false, error: "Anmeldung fehlgeschlagen" };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Anmeldung fehlgeschlagen" };
  }
}
