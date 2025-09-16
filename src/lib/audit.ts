import { prisma } from "@/lib/prisma";

interface AuditEntry {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  diff?: Record<string, unknown> | null;
}

export async function logAudit(entry: AuditEntry) {
  await prisma.auditLog.create({
    data: {
      actorUserId: entry.actorUserId ?? null,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      diff: entry.diff ?? null
    }
  });
}
