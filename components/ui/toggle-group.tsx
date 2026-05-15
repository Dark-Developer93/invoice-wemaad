"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleGroupProps {
  type: "single";
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "default";
}

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const ToggleGroupContext = React.createContext<{
  value: string;
  onValueChange: (v: string) => void;
  size: "sm" | "default";
}>({ value: "", onValueChange: () => {}, size: "default" });

export function ToggleGroup({
  value,
  onValueChange,
  children,
  className,
  size = "default",
}: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange, size }}>
      <div className={cn("flex rounded-md border overflow-hidden", className)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({ value, children, className }: ToggleGroupItemProps) {
  const ctx = React.useContext(ToggleGroupContext);
  const isActive = ctx.value === value;
  const isSmall = ctx.size === "sm";

  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "flex-1 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isSmall ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-muted",
        "border-r last:border-r-0",
        className
      )}
    >
      {children}
    </button>
  );
}
