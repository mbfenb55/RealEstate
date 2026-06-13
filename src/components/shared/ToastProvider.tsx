"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: resolvedTheme === "dark" ? "#0F172A" : "#FFFFFF",
          color: resolvedTheme === "dark" ? "#F8FAFC" : "#0F172A",
          border: `1px solid ${resolvedTheme === "dark" ? "rgba(255,255,255,0.12)" : "#E2E8F0"}`
        }
      }}
    />
  );
}
