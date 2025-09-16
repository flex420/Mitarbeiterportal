import { cn } from "@/lib/utils";

export function Tabs({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
}

export function TabsTrigger({ isActive, onClick, children }: { isActive?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, hidden }: { children: React.ReactNode; hidden?: boolean }) {
  if (hidden) return null;
  return <div>{children}</div>;
}
