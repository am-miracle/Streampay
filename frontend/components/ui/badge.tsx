import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles =
    variant === "outline"
      ? "border border-zinc-700 text-zinc-400"
      : "bg-mint-400/10 text-mint-400 border border-mint-400/20";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
