import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { requestCsrfToken } from "@/lib/csrf";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { RegisterForm } from "@/components/forms/auth-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  const csrfToken = await requestCsrfToken();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Registrierung</CardTitle>
          <CardDescription>Benutzername und Passwort festlegen.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm csrfToken={csrfToken} action={registerAction} />
          <p className="mt-6 text-sm text-slate-600">
            Bereits registriert?{" "}
            <Link className="underline" href="/login">
              Zur Anmeldung
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


