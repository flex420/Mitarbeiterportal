import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface AuditEntry {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  diff?: Record<string, unknown> | null;
}

export async function logAudit(entry: AuditEntry) {
  const diffValue = entry.diff ? (entry.diff as Prisma.InputJsonValue) : Prisma.JsonNull;

  await prisma.auditLog.create({
    data: {
      actorUserId: entry.actorUserId ?? null,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      diff: diffValue
    }
  });
}
