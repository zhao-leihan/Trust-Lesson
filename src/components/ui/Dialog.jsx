"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({ className = "", ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut ${className}`}
      {...props}
    />
  );
}

export function DialogContent({ className = "", children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={`fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-purple-100 duration-200 data-[state=open]:animate-fadeInUp focus:outline-none ${className}`}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none">
          <X size={18} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className = "", ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-left border-b border-slate-100 pb-4 mb-4 ${className}`}
      {...props}
    />
  );
}

export function DialogTitle({ className = "", ...props }) {
  return (
    <DialogPrimitive.Title
      className={`text-lg sm:text-xl font-extrabold text-slate-900 ${className}`}
      {...props}
    />
  );
}

export function DialogDescription({ className = "", ...props }) {
  return (
    <DialogPrimitive.Description
      className={`text-xs text-slate-500 mt-0.5 ${className}`}
      {...props}
    />
  );
}
