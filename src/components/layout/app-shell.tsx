"use client";

import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import { Button } from "@/components/ui/button";

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-semibold">
            Mitarbeiterportal
          </Link>
          <MainNav role={session.user.role} pathname={pathname} />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 md:block">
              {session.user.name ?? session.user.username} ({session.user.role})
            </span>
            <Button
              variant="outline"
              onClick={() => {
                void signOut({ callbackUrl: "/login" });
              }}
            >
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
