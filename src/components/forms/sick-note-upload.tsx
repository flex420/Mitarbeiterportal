"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormResult, type ActionResult } from "@/components/feedback/form-result";

export function SickNoteUploadForm({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setResult({ success: false, error: "Bitte eine Datei auswählen" });
      return;
    }
    const formData = new FormData();
    formData.append("csrfToken", csrfToken);
    formData.append("file", file);
    if (noteRef.current?.value) {
      formData.append("note", noteRef.current.value);
    }

    startTransition(async () => {
      const response = await fetch("/api/sick-notes/upload", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Upload fehlgeschlagen" }));
        setResult({ success: false, error: data.error ?? "Upload fehlgeschlagen" });
        return;
      }
      setResult({ success: true, message: "Upload erfolgreich" });
      if (fileRef.current) fileRef.current.value = "";
      if (noteRef.current) noteRef.current.value = "";
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Datei (PDF/JPG/PNG)</label>
        <Input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Notiz (optional)</label>
        <Textarea ref={noteRef} rows={3} placeholder="Infos für HR" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Lade hoch..." : "Hochladen"}
      </Button>
      <FormResult result={result ?? undefined} />
    </form>
  );
}
