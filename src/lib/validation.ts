import { z } from "zod";
import dayjs from "@/lib/date";
import { allowVacationOverlap } from "@/lib/config";

export const registerSchema = z.object({
  csrfToken: z.string().min(1),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  csrfToken: z.string().min(1),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128)
});

export const vacationCreateSchema = z
  .object({
    csrfToken: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    type: z.enum(["urlaub", "sonder"]),
    comment: z.string().max(500).optional(),
    status: z.enum(["offen", "genehmigt", "gesperrt"]).default("offen")
  })
  .superRefine((values, ctx) => {
    const start = dayjs(values.startDate);
    const end = dayjs(values.endDate);
    if (!start.isValid()) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "Ungültiges Datum" });
    }
    if (!end.isValid()) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "Ungültiges Datum" });
    }
    if (start.isValid() && end.isValid() && end.isBefore(start)) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "Ende muss nach Start liegen" });
    }
  });

export const vacationUpdateSchema = vacationCreateSchema.extend({
  id: z.string().cuid()
});

export type VacationCreateInput = z.infer<typeof vacationCreateSchema>;
export type VacationUpdateInput = z.infer<typeof vacationUpdateSchema>;

export const profileSchema = z.object({
  csrfToken: z.string().min(1),
  vorname: z.string().min(1),
  nachname: z.string().min(1),
  adresse: z.string().min(1),
  telefon: z.string().min(1),
  geburtstag: z.string().optional(),
  bankIban: z.string().optional(),
  steuerId: z.string().optional(),
  notizen: z.string().optional()
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const shiftCreateSchema = z.object({
  csrfToken: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  role: z.string().optional(),
  note: z.string().optional(),
  userIds: z.array(z.string()).default([])
});

export type ShiftCreateInput = z.infer<typeof shiftCreateSchema>;

export const shiftAssignSchema = z.object({
  csrfToken: z.string().min(1),
  shiftId: z.string().cuid(),
  userId: z.string().cuid()
});

export const userRoleSchema = z.object({
  csrfToken: z.string().min(1),
  userId: z.string().cuid(),
  role: z.enum(["ADMIN", "EMPLOYEE"])
});

export const downloadTokenSchema = z.object({
  csrfToken: z.string().min(1),
  sickNoteId: z.string().cuid()
});
