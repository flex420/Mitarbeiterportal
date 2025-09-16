"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shiftCreateSchema, type ShiftCreateInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormResult, type ActionResult } from "@/components/feedback/form-result";
import dayjs from "@/lib/date";
import type { Shift, ShiftAssignment, User } from "@prisma/client";

export function ShiftForm({
  csrfToken,
  users,
  shifts,
  onCreate,
  onAssign,
  onRemove
}: {
  csrfToken: string;
  users: Array<
    Pick<User, "id" | "username"> & { profile: { vorname: string | null; nachname: string | null } | null }
  >;
  shifts: Array<
    Shift & {
      assignments: Array<
        ShiftAssignment & { user: Pick<User, "id" | "username"> & { profile: { vorname: string | null; nachname: string | null } | null } }
      >
    }
  >;
  onCreate: (input: ShiftCreateInput) => Promise<ActionResult>;
  onAssign: (input: { csrfToken: string; shiftId: string; userId: string }) => Promise<ActionResult>;
  onRemove: (input: { csrfToken: string; shiftId: string; userId: string }) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});

  const form = useForm<ShiftCreateInput>({
    resolver: zodResolver(shiftCreateSchema),
    defaultValues: {
      csrfToken,
      date: "",
      startTime: "09:00",
      endTime: "17:00",
      role: "",
      note: "",
      userIds: []
    }
  });

  const handleCreate = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await onCreate(values);
      setResult(response);
      if (response.success) {
        router.refresh();
        form.reset({ ...values, date: "", note: "", csrfToken, userIds: [] });
      }
    });
  });

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Neue Schicht anlegen</h2>
        <input type="hidden" {...form.register("csrfToken")} value={csrfToken} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Datum</label>
            <Input type="date" {...form.register("date")} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Rolle</label>
            <Input placeholder="z. B. Frontoffice" {...form.register("role")} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Start</label>
            <Input type="time" {...form.register("startTime")} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ende</label>
            <Input type="time" {...form.register("endTime")} />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Notiz</label>
          <Textarea rows={3} {...form.register("note")} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Mitarbeitende</label>
          <select
            multiple
            className="min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={form.watch("userIds")}
            onChange={(event) => {
              const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
              form.setValue("userIds", selected);
            }}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.profile?.vorname ?? user.username} {user.profile?.nachname ?? ""}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Speichere..." : "Schicht anlegen"}
        </Button>
        <FormResult result={result ?? undefined} />
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Bestehende Schichten</h2>
        {shifts.map((shift) => (
          <div key={shift.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="font-medium">
                {dayjs(shift.date).format("DD.MM.YYYY")} {dayjs(shift.startTime).format("HH:mm")} - {dayjs(shift.endTime).format("HH:mm")}
              </p>
              <p className="text-sm text-slate-600">{shift.role ?? "Allgemein"}</p>
              {shift.note && <p className="text-sm text-slate-500">{shift.note}</p>}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Zugewiesene Mitarbeitende</p>
              <ul className="space-y-2">
                {shift.assignments.map((assignment) => (
                  <li key={assignment.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                    <span>
                      {assignment.user.profile?.vorname ?? assignment.user.username} {assignment.user.profile?.nachname ?? ""}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const response = await onRemove({
                            csrfToken,
                            shiftId: shift.id,
                            userId: assignment.userId
                          });
                          setResult(response);
                          if (response.success) router.refresh();
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={assignSelection[shift.id] ?? ""}
                  onChange={(event) =>
                    setAssignSelection((prev) => ({ ...prev, [shift.id]: event.target.value }))
                  }
                >
                  <option value="">-- Mitarbeiter wählen --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.profile?.vorname ?? user.username} {user.profile?.nachname ?? ""}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || !assignSelection[shift.id]}
                  onClick={() => {
                    const userId = assignSelection[shift.id];
                    if (!userId) return;
                    startTransition(async () => {
                      const response = await onAssign({ csrfToken, shiftId: shift.id, userId });
                      setResult(response);
                      if (response.success) {
                        router.refresh();
                        setAssignSelection((prev) => ({ ...prev, [shift.id]: "" }));
                      }
                    });
                  }}
                >
                  Hinzufügen
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
