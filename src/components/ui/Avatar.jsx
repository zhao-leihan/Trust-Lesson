"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export function Avatar({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Root
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-2xl shadow-sm ${className}`}
      {...props}
    />
  );
}

export function AvatarImage({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Image
      className={`aspect-square h-full w-full object-cover ${className}`}
      {...props}
    />
  );
}

export function AvatarFallback({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Fallback
      className={`flex h-full w-full items-center justify-center rounded-2xl font-extrabold text-sm uppercase select-none ${className}`}
      {...props}
    />
  );
}
