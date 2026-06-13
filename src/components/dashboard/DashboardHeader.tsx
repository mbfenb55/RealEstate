"use client";

import { Bell, Menu } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function initials(name?: string | null) {
  if (!name) return "DU";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardHeader({
  onMenuClick
}: {
  onMenuClick: () => void;
}) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-slate-500">Hoş geldiniz</p>
          <h2 className="text-lg font-semibold text-slate-900">
            {profile?.fullName || profile?.companyName || "Parselim Panel"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" className="px-3 py-2 text-xs font-semibold">
          {profile?.credits ?? 0} Kredi
        </Badge>
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition-all duration-300 hover:scale-105"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-secondary" />
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials(profile?.fullName)}
        </div>
      </div>
    </header>
  );
}
