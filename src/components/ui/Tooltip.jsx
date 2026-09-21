"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className = "", sideOffset = 4, ...props }) {
  return (
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      className={`z-50 overflow-hidden rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-medium text-white shadow-md animate-fadeIn ${className}`}
      {...props}
    />
  );
}
