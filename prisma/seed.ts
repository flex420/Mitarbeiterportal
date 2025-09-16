import { PrismaClient, Role, VacationStatus, VacationType } from "@prisma/client";
import argon2 from "argon2";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("Passwort123!");

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      role: Role.ADMIN,
      passwordHash,
      profile: {
        create: {
          vorname: "Admin",
          nachname: "Portal",
          adresse: "Marktplatz 1, 10115 Berlin",
          telefon: "+49 30 000000",
          bankIban: "DE12500105170648489890",
          steuerId: "12 345 678 901",
          notizen: "Systemadministrator"
        }
      }
    }
  });

  const max = await prisma.user.upsert({
    where: { username: "max" },
    update: {},
    create: {
      username: "max",
      role: Role.EMPLOYEE,
      passwordHash,
      profile: {
        create: {
          vorname: "Max",
          nachname: "Muster",
          adresse: "Goethestr. 10, 10555 Berlin",
          telefon: "+49 30 111111",
          bankIban: "DE75512108001245126199",
          notizen: "Vertrieb"
        }
      }
    }
  });

  const anna = await prisma.user.upsert({
    where: { username: "anna" },
    update: {},
    create: {
      username: "anna",
      role: Role.EMPLOYEE,
      passwordHash,
      profile: {
        create: {
          vorname: "Anna",
          nachname: "Beispiel",
          adresse: "Seestr. 45, 13353 Berlin",
          telefon: "+49 30 222222",
          bankIban: "DE22500105178828772000",
          notizen: "HR"
        }
      }
    }
  });

  await prisma.vacation.createMany({
    data: [
      {
        userId: max.id,
        startDate: dayjs().add(5, "day").startOf("day").toDate(),
        endDate: dayjs().add(10, "day").endOf("day").toDate(),
        type: VacationType.URLAUB,
        status: VacationStatus.GENEHMIGT,
        comment: "Sommerurlaub"
      },
      {
        userId: anna.id,
        startDate: dayjs().add(12, "day").startOf("day").toDate(),
        endDate: dayjs().add(14, "day").endOf("day").toDate(),
        type: VacationType.SONDER,
        status: VacationStatus.OFFEN,
        comment: "Fortbildung"
      }
    ]
  });

  const shift = await prisma.shift.create({
    data: {
      date: dayjs().startOf("day").toDate(),
      startTime: dayjs().hour(9).minute(0).toDate(),
      endTime: dayjs().hour(17).minute(0).toDate(),
      role: "Frontoffice",
      note: "Reguläre Schicht"
    }
  });

  await prisma.shiftAssignment.createMany({
    data: [
      { shiftId: shift.id, userId: max.id },
      { shiftId: shift.id, userId: anna.id }
    ]
  });

  console.info("Seed abgeschlossen");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
