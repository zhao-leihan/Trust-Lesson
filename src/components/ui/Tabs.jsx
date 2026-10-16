"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className = "", ...props }) {
  return (
    <TabsPrimitive.List
      className={`inline-flex items-center gap-1.5 p-1 bg-gray-100 rounded-full ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({ className = "", ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:font-semibold data-[state=active]:shadow-2xs hover:text-gray-900 cursor-pointer ${className}`}
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
