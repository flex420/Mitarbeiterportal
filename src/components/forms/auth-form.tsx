"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormResult } from "@/components/feedback/form-result";
import type { ActionResult } from "@/components/feedback/form-result";

export function LoginForm({ csrfToken, action }: { csrfToken: string; action: (state: ActionResult | null, formData: FormData) => Promise<ActionResult> }) {
  const [state, formAction] = useFormState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div>
        <Label htmlFor="username">Benutzername</Label>
        <Input id="username" name="username" required minLength={3} autoComplete="username" />
      </div>
      <div>
        <Label htmlFor="password">Passwort</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" />
      </div>
      <Button className="w-full" type="submit">
        Anmelden
      </Button>
      <FormResult result={state ?? undefined} />
    </form>
  );
}

export function RegisterForm({ csrfToken, action }: { csrfToken: string; action: (state: ActionResult | null, formData: FormData) => Promise<ActionResult> }) {
  const [state, formAction] = useFormState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div>
        <Label htmlFor="username">Benutzername</Label>
        <Input id="username" name="username" required minLength={3} autoComplete="username" />
      </div>
      <div>
        <Label htmlFor="password">Passwort</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <Button className="w-full" type="submit">
        Registrieren
      </Button>
      <FormResult result={state ?? undefined} />
    </form>
  );
}
