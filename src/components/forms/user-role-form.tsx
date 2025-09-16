"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormResult, type ActionResult } from "@/components/feedback/form-result";

export function UserRoleForm({
  users,
  csrfToken,
  onChange
}: {
  users: Array<User & { profile: { vorname: string | null; nachname: string | null } | null }>;
  csrfToken: string;
  onChange: (input: { csrfToken: string; userId: string; role: "ADMIN" | "EMPLOYEE" }) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <form
          key={user.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const role = formData.get("role") as "ADMIN" | "EMPLOYEE" | null;
            if (!role) return;
            startTransition(async () => {
              const response = await onChange({ csrfToken, userId: user.id, role });
              setResult(response);
              if (response.success) router.refresh();
            });
          }}
        >
          <div className="flex-1 text-sm">
            <p className="font-medium">
              {user.profile?.vorname ?? user.username} {user.profile?.nachname ?? ""}
            </p>
            <p className="text-slate-500">{user.username}</p>
          </div>
          <select
            name="role"
            defaultValue={user.role}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            disabled={isPending}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit" size="sm" disabled={isPending}>
            Speichern
          </Button>
        </form>
      ))}
      <FormResult result={result ?? undefined} />
    </div>
  );
}
