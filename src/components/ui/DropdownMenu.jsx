"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({ className = "", sideOffset = 4, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={`z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut ${className}`}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className = "", ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors hover:bg-purple-50 hover:text-purple-900 focus:bg-purple-50 focus:text-purple-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className = "", ...props }) {
  return (
    <DropdownMenuPrimitive.Separator
      className={`-mx-1 my-1 h-px bg-slate-100 ${className}`}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className = "", ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${className}`}
      {...props}
    />
  );
}
