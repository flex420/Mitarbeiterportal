import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", children }: { className?: string; variant?: "default" | "success" | "secondary"; children: React.ReactNode }) {
  const variants = {
    default: "bg-slate-200 text-slate-700",
    success: "bg-green-100 text-green-800",
    secondary: "bg-slate-100 text-slate-600"
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
