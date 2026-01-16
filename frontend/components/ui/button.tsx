import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

    const variants = {
      primary:
        "bg-mint-400 text-zinc-950 hover:bg-mint-300 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] h-11 px-8",
      secondary:
        "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 h-11 px-8 border border-zinc-700",
      ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 h-10 px-4",
      outline:
        "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-100 h-11 px-8",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
