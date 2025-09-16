import { VacationCreateForm } from "@/components/forms/vacation-form";
import { VacationCalendar } from "@/components/calendar/vacation-calendar";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import { issueCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import dayjs from "@/lib/date";
import {
  createVacationAction,
  updateVacationAction,
  deleteVacationAction,
  updateVacationStatusAction
} from "@/app/actions/vacations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function VacationPage() {
  const session = await auth();
  const currentUser = requireUser(session);

  const vacations = await prisma.vacation.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: { startDate: "asc" }
  });

  const csrfToken = issueCsrfToken();
  const ownVacations = vacations.filter((vac) => vac.userId === currentUser.id);

  const calendarEvents = vacations.map((vac) => ({
    id: vac.id,
    title: `${vac.user.profile?.vorname ?? vac.user.username} ${vac.user.profile?.nachname ?? ""}`.trim(),
    start: vac.startDate.toISOString(),
    end: dayjs(vac.endDate).add(1, "day").toISOString(),
    extendedProps: { status: vac.status, type: vac.type }
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="rounded-xl bg-white p-4 shadow">
          <VacationCalendar events={calendarEvents} />
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Neuen Urlaub beantragen</h2>
          <p className="text-sm text-slate-600">
            Keine Überschneidungen erlaubt (konfigurierbar), Admin kann Status anpassen.
          </p>
          <div className="mt-4">
            <VacationCreateForm csrfToken={csrfToken} action={createVacationAction} />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold">Eigene Anträge</h2>
        {ownVacations.length === 0 && <p className="text-sm text-slate-600">Noch keine Anträge.</p>}
        {ownVacations.map((vacation) => (
          <div key={vacation.id} className="rounded-lg border border-slate-200 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">
                  {dayjs(vacation.startDate).format("DD.MM.YYYY")} – {dayjs(vacation.endDate).format("DD.MM.YYYY")}
                </p>
                <p className="text-sm text-slate-600">{vacation.comment ?? "Kein Kommentar"}</p>
              </div>
              <Badge>{vacation.status}</Badge>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-2"
              action={async (formData) => {
                "use server";
                const startDate = String(formData.get("startDate") ?? "");
                const endDate = String(formData.get("endDate") ?? "");
                const type = String(formData.get("type") ?? "urlaub");
                const comment = String(formData.get("comment") ?? "");
                await updateVacationAction({
                  csrfToken,
                  id: vacation.id,
                  startDate,
                  endDate,
                  type,
                  comment
                });
              }}
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <div className="grid gap-2">
                <label className="text-xs font-medium">Von</label>
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  type="date"
                  name="startDate"
                  defaultValue={dayjs(vacation.startDate).format("YYYY-MM-DD")}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium">Bis</label>
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  type="date"
                  name="endDate"
                  defaultValue={dayjs(vacation.endDate).format("YYYY-MM-DD")}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium">Typ</label>
                <select
                  name="type"
                  defaultValue={vacation.type.toLowerCase()}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="urlaub">Urlaub</option>
                  <option value="sonder">Sonderurlaub</option>
                </select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <label className="text-xs font-medium">Kommentar</label>
                <textarea
                  name="comment"
                  defaultValue={vacation.comment ?? ""}
                  className="min-h-[60px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" size="sm">
                  Speichern
                </Button>
              </div>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteVacationAction({ id: vacation.id, csrfToken });
              }}
            >
              <Button type="submit" variant="destructive" size="sm">
                Löschen
              </Button>
            </form>
          </div>
        ))}
      </section>

      {currentUser.role === "ADMIN" && (
        <section className="rounded-xl bg-white p-6 shadow space-y-3">
          <h2 className="text-lg font-semibold">Admin-Übersicht</h2>
          {vacations.map((vacation) => (
            <form
              key={vacation.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              action={async (formData) => {
                "use server";
                const status = String(formData.get("status") ?? "offen");
                await updateVacationStatusAction({
                  id: vacation.id,
                  status,
                  csrfToken
                });
              }}
            >
              <div className="flex-1 text-sm">
                <p className="font-medium">
                  {vacation.user.profile?.vorname ?? vacation.user.username} {vacation.user.profile?.nachname ?? ""}
                </p>
                <p className="text-slate-500">
                  {dayjs(vacation.startDate).format("DD.MM.YYYY")} – {dayjs(vacation.endDate).format("DD.MM.YYYY")}
                </p>
              </div>
              <select
                name="status"
                defaultValue={vacation.status.toLowerCase()}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="offen">Offen</option>
                <option value="genehmigt">Genehmigt</option>
                <option value="gesperrt">Gesperrt</option>
              </select>
              <Button type="submit" size="sm" variant="outline">
                Aktualisieren
              </Button>
            </form>
          ))}
        </section>
      )}
    </div>
  );
}
