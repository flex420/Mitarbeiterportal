import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { issueCsrfToken } from "@/lib/csrf";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { LoginForm } from "@/components/forms/auth-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  const csrfToken = await issueCsrfToken();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Anmeldung</CardTitle>
          <CardDescription>Melde dich mit deinem Benutzernamen an.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm csrfToken={csrfToken} action={loginAction} />
          <p className="mt-6 text-sm text-slate-600">
            Noch kein Zugang?{" "}
            <Link className="underline" href="/register">
              Jetzt registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
