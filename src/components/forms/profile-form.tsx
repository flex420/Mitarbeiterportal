"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormResult, type ActionResult } from "@/components/feedback/form-result";

export function ProfileForm({
  csrfToken,
  profile,
  action
}: {
  csrfToken: string;
  profile: {
    vorname: string;
    nachname: string;
    adresse: string;
    telefon: string;
    geburtstag: string | null;
    bankIban: string | null;
    steuerId: string | null;
    notizen: string | null;
  } | null;
  action: (input: ProfileInput) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      csrfToken,
      vorname: profile?.vorname ?? "",
      nachname: profile?.nachname ?? "",
      adresse: profile?.adresse ?? "",
      telefon: profile?.telefon ?? "",
      geburtstag: profile?.geburtstag ?? "",
      bankIban: profile?.bankIban ?? "",
      steuerId: profile?.steuerId ?? "",
      notizen: profile?.notizen ?? ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await action(values);
      setResult(response);
      if (response.success) {
        router.refresh();
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" {...form.register("csrfToken")} value={csrfToken} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Vorname</label>
          <Input {...form.register("vorname")} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Nachname</label>
          <Input {...form.register("nachname")} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Adresse</label>
        <Textarea rows={2} {...form.register("adresse")} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Telefon</label>
          <Input {...form.register("telefon")} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Geburtstag</label>
          <Input type="date" {...form.register("geburtstag")} />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">IBAN (optional)</label>
          <Input {...form.register("bankIban")} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Steuer-ID (optional)</label>
          <Input {...form.register("steuerId")} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Notizen</label>
        <Textarea rows={4} {...form.register("notizen")} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Speichere..." : "Speichern"}
      </Button>
      <FormResult result={result ?? undefined} />
    </form>
  );
}
