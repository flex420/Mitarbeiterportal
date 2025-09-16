import { cn } from "@/lib/utils";

export function Alert({ children, variant = "info", className }: { children: React.ReactNode; variant?: "info" | "error" | "success"; className?: string }) {
  const variants = {
    info: "border-slate-200 bg-slate-50 text-slate-700",
    error: "border-red-300 bg-red-50 text-red-700",
    success: "border-green-300 bg-green-50 text-green-700"
  } as const;
  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", variants[variant], className)}>
      {children}
    </div>
  );
}
