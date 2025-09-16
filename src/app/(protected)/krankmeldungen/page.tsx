import { SickNoteUploadForm } from "@/components/forms/sick-note-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { issueCsrfToken } from "@/lib/csrf";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import dayjs from "@/lib/date";
import { createDownloadTokenAction } from "@/app/actions/sick-notes";
import { redirect } from "next/navigation";

export default async function SickNotesPage() {
  const session = await auth();
  const currentUser = requireUser(session);

  const csrfToken = await issueCsrfToken();

  const notes = await prisma.sickNote.findMany({
    where: currentUser.role === "ADMIN" ? {} : { userId: currentUser.id },
    include: { user: { include: { profile: true } } },
    orderBy: { uploadedAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Krankmeldung hochladen</CardTitle>
        </CardHeader>
        <CardContent>
          <SickNoteUploadForm csrfToken={csrfToken} />
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>
                  {note.user.profile?.vorname ?? note.user.username} {note.user.profile?.nachname ?? ""}
                </span>
                <span className="text-sm text-slate-500">
                  {dayjs(note.uploadedAt).format("DD.MM.YYYY HH:mm")} Uhr
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">Datei: {note.fileName}</p>
              {note.note && <p className="text-sm text-slate-600">Notiz: {note.note}</p>}
              <form
                action={async () => {
                  "use server";
                  const result = await createDownloadTokenAction({
                    csrfToken,
                    sickNoteId: note.id
                  });
                  if (result.success && result.token) {
                    redirect(`/api/files/${result.token}`);
                  }
                  throw new Error(result.success ? "Download fehlgeschlagen" : result.error);
                }}
              >
                <Button variant="outline">Signierten Download starten</Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-slate-600">Noch keine hochgeladenen Krankmeldungen.</p>
        )}
      </section>
    </div>
  );
}
