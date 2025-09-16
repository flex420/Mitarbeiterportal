import { UserRoleForm } from "@/components/forms/user-role-form";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { issueCsrfToken } from "@/lib/csrf";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { updateUserRoleAction } from "@/app/actions/users";
import dayjs from "@/lib/date";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  const admin = requireAdmin(session);

  const [users, auditLogs] = await Promise.all([
    prisma.user.findMany({ include: { profile: true } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: true }
    })
  ]);

  const csrfToken = await issueCsrfToken();

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Benutzerverwaltung</h2>
        <UserRoleForm users={users} csrfToken={csrfToken} onChange={updateUserRoleAction} />
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Audit-Trail (letzte 20)</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead>Entität</TableHead>
                <TableHead>Auslöser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {dayjs(log.createdAt).format("DD.MM.YYYY HH:mm")} Uhr
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.entityType} – {log.entityId}
                  </TableCell>
                  <TableCell>{log.actor?.username ?? "System"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold mb-3">PDF-Export</h2>
        <p className="text-sm text-slate-600 mb-3">
          Stammdaten anderer Mitarbeitender als PDF herunterladen.
        </p>
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <Button key={user.id} variant="outline" asChild>
              <Link href={`/api/admin/profiles/${user.id}/pdf`} prefetch={false}>
                {user.profile?.vorname ?? user.username} {user.profile?.nachname ?? ""}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
