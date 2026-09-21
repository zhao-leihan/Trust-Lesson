"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className = "", ...props }) {
  return (
    <TabsPrimitive.List
      className={`inline-flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({ className = "", ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold text-slate-600 transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer ${className}`}
      {...props}
    />
  );
}

export function TabsContent({ className = "", ...props }) {
  return (
    <TabsPrimitive.Content
      className={`mt-4 focus:outline-none data-[state=active]:animate-fadeIn ${className}`}
      {...props}
    />
  );
}
