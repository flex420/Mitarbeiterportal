"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vacationCreateSchema, type VacationCreateInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormResult, type ActionResult } from "@/components/feedback/form-result";

export function VacationCreateForm({
  csrfToken,
  action
}: {
  csrfToken: string;
  action: (input: VacationCreateInput) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<VacationCreateInput>({
    resolver: zodResolver(vacationCreateSchema),
    defaultValues: {
      csrfToken,
      startDate: "",
      endDate: "",
      type: "urlaub",
      comment: "",
      status: "offen"
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await action(values);
      setResult(response);
      if (response.success) {
        router.refresh();
        form.reset({ ...values, startDate: "", endDate: "", comment: "", csrfToken });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" {...form.register("csrfToken")} value={csrfToken} />
      <div className="grid gap-2">
        <label className="text-sm font-medium">Von</label>
        <Input type="date" {...form.register("startDate")} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Bis</label>
        <Input type="date" {...form.register("endDate")} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Typ</label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          {...form.register("type")}
        >
          <option value="urlaub">Urlaub</option>
          <option value="sonder">Sonderurlaub</option>
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Kommentar (optional)</label>
        <Textarea rows={3} {...form.register("comment")} placeholder="Hinweise für HR" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Wird gespeichert..." : "Antrag senden"}
      </Button>
      <FormResult result={result ?? undefined} />
    </form>
  );
}
