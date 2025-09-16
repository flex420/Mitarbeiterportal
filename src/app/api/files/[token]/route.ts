import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import dayjs from "@/lib/date";

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const session = await auth();
  const user = requireUser(session);

  const download = await prisma.downloadToken.findUnique({
    where: { token: params.token },
    include: {
      sickNote: { include: { user: true } }
    }
  });

  if (!download) {
    return NextResponse.json({ error: "Token ungültig" }, { status: 404 });
  }

  if (dayjs(download.expiresAt).isBefore(dayjs())) {
    return NextResponse.json({ error: "Token abgelaufen" }, { status: 410 });
  }

  if (user.role !== "ADMIN" && download.userId !== user.id && download.sickNote.userId !== user.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const file = await storage.read(download.sickNote.fileKey);
  if (!file) {
    return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
  }

  await prisma.downloadToken.delete({ where: { id: download.id } });

  await logAudit({
    actorUserId: user.id,
    entityType: "SickNote",
    entityId: download.sickNoteId,
    action: "DOWNLOAD",
    diff: { fileName: download.sickNote.fileName }
  });

  return new NextResponse(file, {
    headers: {
      "Content-Type": download.sickNote.mimeType,
      "Content-Disposition": ttachment; filename=""
    }
  });
}
