import { ProfileForm } from "@/components/forms/profile-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestCsrfToken } from "@/lib/csrf";
import { requireUser } from "@/lib/rbac";
import { updateProfileAction } from "@/app/actions/profiles";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dayjs from "@/lib/date";

export default async function ProfilePage() {
  const session = await auth();
  const currentUser = requireUser(session);

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: currentUser.id }
  });

  const csrfToken = await requestCsrfToken();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Eigene Stammdaten</h2>
        <div className="mt-4">
          <ProfileForm
            csrfToken={csrfToken}
            profile={
              profile
                ? {
                    vorname: profile.vorname,
                    nachname: profile.nachname,
                    adresse: profile.adresse,
                    telefon: profile.telefon,
                    geburtstag: profile.geburtstag ? dayjs(profile.geburtstag).format("YYYY-MM-DD") : null,
                    bankIban: profile.bankIban,
                    steuerId: profile.steuerId,
                    notizen: profile.notizen
                  }
                : null
            }
            action={updateProfileAction}
          />
        </div>
      </div>
      <div className="rounded-xl bg-white p-6 shadow space-y-4">
        <h3 className="text-base font-semibold">Export</h3>
        <p className="text-sm text-slate-600">
          Admins können Stammdaten exportieren. Fordere bei Bedarf einen Export an.
        </p>
        {currentUser.role === "ADMIN" && (
          <Button asChild variant="outline">
            <Link href={`/api/admin/profiles/${currentUser.id}/pdf`} prefetch={false}>
              Eigenen PDF-Export laden
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}


