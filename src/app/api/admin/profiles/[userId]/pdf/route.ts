import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { renderProfilePdf } from "@/lib/pdf";
import { logAudit } from "@/lib/audit";

export async function GET(_request: NextRequest, { params }: { params: { userId: string } }) {
  const session = await auth();
  const admin = requireAdmin(session);

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: params.userId },
    include: { user: true }
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });
  }

  const buffer = await renderProfilePdf(profile);
  const body = buffer as unknown as BodyInit;

  await logAudit({
    actorUserId: admin.id,
    entityType: "EmployeeProfile",
    entityId: profile.id,
    action: "PDF_EXPORT",
    diff: { targetUser: profile.user.username }
  });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="profil-${profile.user.username}.pdf"`
    }
  });
}
