"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className = "", ...props }) {
  const isCustomDisplay = className.includes("flex") || className.includes("grid");
  const defaultDisplay = isCustomDisplay ? "" : "inline-flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar scroll-smooth";
  return (
    <TabsPrimitive.List
      className={`${defaultDisplay} p-1.5 bg-slate-100/90 rounded-2xl max-w-full ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({ className = "", ...props }) {
  const hasShrink = className.includes("shrink") || className.includes("flex-1") || className.includes("w-full");
  const defaultShrink = hasShrink ? "" : "shrink-0";
  return (
    <TabsPrimitive.Trigger
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:font-bold data-[state=active]:shadow-2xs hover:text-slate-900 cursor-pointer ${defaultShrink} ${className}`}
      {...props}
    />
  );
}

export function TabsContent({ className = "", ...props }) {
  return (
    <TabsPrimitive.Content
      className={`mt-6 focus:outline-none data-[state=active]:animate-fadeIn ${className}`}
      {...props}
    />
  );
}
