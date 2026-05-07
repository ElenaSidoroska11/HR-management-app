"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "group rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg",
          title: "text-sm font-medium",
          description: "text-sm text-gray-600",
          error: "!border-red-200 !bg-red-50 !text-red-900",
          success: "!border-emerald-200 !bg-emerald-50 !text-emerald-900",
        },
      }}
    />
  );
}
