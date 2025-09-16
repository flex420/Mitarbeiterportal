import { ShiftCalendar } from "@/components/calendar/shift-calendar";
import { ShiftForm } from "@/components/forms/shift-form";
import { auth } from "@/lib/auth";
import { requestCsrfToken } from "@/lib/csrf";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import dayjs from "@/lib/date";
import {
  createShiftAction,
  assignShiftAction,
  removeShiftAssignmentAction
} from "@/app/actions/shifts";

export default async function ShiftPage() {
  const session = await auth();
  const currentUser = requireUser(session);

  const [shifts, users] = await Promise.all([
    prisma.shift.findMany({
      include: {
        assignments: { include: { user: { include: { profile: true } } } }
      },
      orderBy: { date: "asc" }
    }),
    prisma.user.findMany({ include: { profile: true } })
  ]);

  const csrfToken = await requestCsrfToken();

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role ?? "Schicht"} (${shift.assignments.length} MA)`,
    start: shift.startTime.toISOString(),
    end: shift.endTime.toISOString(),
    extendedProps: {
      employees: shift.assignments.map((assignment) =>
        assignment.user.profile?.vorname ?? assignment.user.username
      )
    }
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-4 shadow">
        <ShiftCalendar events={events} />
      </div>

      {currentUser.role === "ADMIN" ? (
        <ShiftForm
          csrfToken={csrfToken}
          users={users}
          shifts={shifts}
          onCreate={createShiftAction}
          onAssign={assignShiftAction}
          onRemove={removeShiftAssignmentAction}
        />
      ) : (
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Geplante Schichten</h2>
          <ul className="mt-4 space-y-2">
            {shifts.map((shift) => (
              <li key={shift.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">
                  {dayjs(shift.date).format("DD.MM.YYYY")} {dayjs(shift.startTime).format("HH:mm")} – {dayjs(shift.endTime).format("HH:mm")}
                </p>
                <p className="text-sm text-slate-600">
                  Rolle: {shift.role ?? "Allgemein"} | Zugewiesen: {shift.assignments
                    .map((assignment) =>
                      assignment.user.profile?.vorname ?? assignment.user.username
                    )
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


