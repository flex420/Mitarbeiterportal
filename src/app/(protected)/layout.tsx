import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return <AppShell session={session}>{children}</AppShell>;
}
