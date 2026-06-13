"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellRing, CreditCard, FileText, Home, ListVideo, LogOut, PlusCircle, Settings, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/yeni-cekim", label: "Yeni Çekim", icon: PlusCircle },
  { href: "/dashboard/cekimlerim", label: "Çekimlerim", icon: ListVideo },
  { href: "/dashboard/paketler", label: "Paket Al", icon: CreditCard },
  { href: "/dashboard/faturalar", label: "Faturalar", icon: FileText },
  { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings }
];

function initials(name?: string | null) {
  if (!name) return "DU";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar({
  mobileOpen,
  onClose
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/giris");
    router.refresh();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white">
              P
            </div>
            <div>
              <p className="font-semibold text-slate-900">Parselim</p>
              <p className="text-xs text-slate-500">Operasyon Paneli</p>
            </div>
          </Link>

          <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-foreground">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">İlk çekim ücretsiz</p>
                <p className="text-xs text-slate-500">Kalan kredinizi hemen kullanın</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initials(profile?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{profile?.fullName || "Kullanıcı"}</p>
              <p className="truncate text-xs text-slate-500">{profile?.email || "E-posta yok"}</p>
            </div>
          </div>

          <Button type="button" variant="outline" className="mt-3 w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>
    </>
  );
}
