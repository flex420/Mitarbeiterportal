import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "destructive" | "ghost";

type Size = "default" | "sm" | "lg";

const variantClasses: Record<Variant, string> = {
  default: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-slate-600 hover:bg-slate-100"
};

const sizeClasses: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-sm",
  lg: "h-12 px-6 text-base"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const Comp = "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref as any}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
