"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/urlaubskalender", label: "Urlaubskalender" },
  { href: "/dienstplan", label: "Dienstplan" },
  { href: "/krankmeldungen", label: "Krankmeldungen" },
  { href: "/profil", label: "Profil/Stammdaten" },
  { href: "/admin", label: "Admin", role: "ADMIN" as const }
];

export function MainNav({ pathname, role }: { pathname: string; role: string }) {
  return (
    <nav className="hidden gap-4 md:flex">
      {links
        .filter((link) => !link.role || link.role === role)
        .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(link.href)
                ? "bg-brand text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {link.label}
          </Link>
        ))}
    </nav>
  );
}
