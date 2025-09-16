import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mitarbeiterportal",
  description: "Modernes Mitarbeiterportal für Urlaub, Krankmeldungen und Dienstplan",
  metadataBase: new URL(process.env.APP_BASE_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className={cn("min-h-full bg-slate-50 text-slate-900 antialiased")}>{children}</body>
    </html>
  );
}
