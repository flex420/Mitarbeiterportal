import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { verifyCsrfToken } from "@/lib/csrf";
import { getUploadLimitMb } from "@/lib/config";
import { logAudit } from "@/lib/audit";
import { getUploadLimiter } from "@/lib/rateLimit";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = requireUser(session);

  const limiter = getUploadLimiter();
  const rateOk = limiter.consume(`upload:${user.id}`, 1);
  if (!rateOk.ok) {
    return NextResponse.json({ error: "Zu viele Uploads. Bitte kurz warten." }, { status: 429 });
  }

  const formData = await request.formData();
  const csrfToken = formData.get("csrfToken");
  await verifyCsrfToken(typeof csrfToken === "string" ? csrfToken : null);

  const file = formData.get("file");
  const note = formData.get("note");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Datei fehlt" }, { status: 400 });
  }

  const allowedMime = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowedMime.includes(file.type)) {
    return NextResponse.json({ error: "Nur PDF, PNG oder JPG erlaubt." }, { status: 400 });
  }

  const maxBytes = getUploadLimitMb() * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Datei zu groß." }, { status: 400 });
  }

  const fileKey = `sick-notes/${user.id}/${nanoid()}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await storage.save(fileKey, buffer);

  const sickNote = await prisma.sickNote.create({
    data: {
      userId: user.id,
      fileKey,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      note: typeof note === "string" && note.length > 0 ? note : null
    }
  });

  await logAudit({
    actorUserId: user.id,
    entityType: "SickNote",
    entityId: sickNote.id,
    action: "UPLOAD",
    diff: { fileName: sickNote.fileName }
  });

  return NextResponse.json({ success: true });
}
