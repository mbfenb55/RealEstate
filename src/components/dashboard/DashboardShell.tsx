"use client";

import { useState } from "react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="min-h-screen min-w-0 flex-1 lg:ml-0">
          <div className="rounded-none bg-white lg:min-h-screen lg:rounded-l-[2rem] lg:border-l lg:border-slate-200">
            <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
            <main className="min-w-0 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
