import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/rbac";
import dayjs from "@/lib/date";

export default async function DashboardPage() {
  const session = await auth();
  const currentUser = requireUser(session);

  const [vacations, sickNotes, shifts] = await Promise.all([
    prisma.vacation.count({ where: { userId: currentUser.id } }),
    prisma.sickNote.count({ where: { userId: currentUser.id } }),
    prisma.shift.count()
  ]);

  const upcomingVacations = await prisma.vacation.findMany({
    where: { startDate: { gte: dayjs().startOf("day").toDate() } },
    include: { user: { include: { profile: true } } },
    orderBy: { startDate: "asc" },
    take: 3
  });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Urlaub</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{vacations}</p>
          <p className="text-sm text-slate-500">Eigene Urlaube</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Krankmeldungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{sickNotes}</p>
          <p className="text-sm text-slate-500">Upload-Historie</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Schichten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{shifts}</p>
          <p className="text-sm text-slate-500">Geplante Dienste</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Bevorstehende Abwesenheiten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingVacations.length === 0 ? (
            <p className="text-sm text-slate-500">Keine anstehenden Abwesenheiten.</p>
          ) : (
            upcomingVacations.map((vacation) => (
              <div key={vacation.id} className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
                <div>
                  <p className="font-medium">
                    {vacation.user.profile?.vorname ?? vacation.user.username} {vacation.user.profile?.nachname ?? ""}
                  </p>
                  <p className="text-sm text-slate-600">
                    {dayjs(vacation.startDate).format("DD.MM.YYYY")} – {dayjs(vacation.endDate).format("DD.MM.YYYY")}
                  </p>
                </div>
                <Badge variant={vacation.status === "genehmigt" ? "success" : "secondary"}>
                  {vacation.status.toUpperCase()}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
