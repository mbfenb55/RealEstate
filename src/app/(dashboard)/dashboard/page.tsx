"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { ShootTable } from "@/components/dashboard/ShootTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useShoots } from "@/hooks/useShoots";
import { isAdmin } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils";
import { getDashboardMetrics } from "@/lib/dashboard";
import type { AdminOverviewData } from "@/lib/admin-overview";

type DashboardTab = "own" | "all";

export default function DashboardPage() {
  const { profile, user, loading: authLoading } = useAuth();
  const { shoots, loading } = useShoots();
  const [adminOverview, setAdminOverview] = useState<AdminOverviewData | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("own");

  const adminUser = isAdmin(profile?.email ?? user?.email ?? "");

  useEffect(() => {
    if (!adminUser) {
      setAdminOverview(null);
      setAdminError(null);
      setActiveTab("own");
      return;
    }

    let mounted = true;

    const loadAdminOverview = async () => {
      setAdminLoading(true);
      setAdminError(null);

      try {
        const response = await fetch("/api/admin/overview", {
          cache: "no-store"
        });

        const payload = (await response.json().catch(() => null)) as AdminOverviewData | { error?: string } | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error ?? "Admin verileri alınamadı.");
        }

        if (mounted && payload && "stats" in payload) {
          setAdminOverview(payload as AdminOverviewData);
        }
      } catch (error) {
        if (mounted) {
          setAdminError(error instanceof Error ? error.message : "Admin verileri alınamadı.");
          setAdminOverview(null);
        }
      } finally {
        if (mounted) {
          setAdminLoading(false);
        }
      }
    };

    void loadAdminOverview();

    return () => {
      mounted = false;
    };
  }, [adminUser]);

  const metrics = useMemo(() => {
    if (adminUser && adminOverview) {
      return [
        {
          label: "Toplam Kullanıcı",
          value: String(adminOverview.stats.totalUsers),
          delta: "Tüm platform kayıtları"
        },
        {
          label: "Toplam Çekim",
          value: String(adminOverview.stats.totalShoots),
          delta: "Platform genelindeki kayıtlar"
        },
        {
          label: "Toplam Gelir",
          value: formatCurrency(adminOverview.stats.totalRevenue),
          delta: "Başarılı ödemelerin toplamı"
        },
        {
          label: "Hazır Çekim",
          value: String(adminOverview.stats.readyShoots),
          delta: "Teslimata hazır kayıt sayısı"
        }
      ];
    }

    return getDashboardMetrics(shoots, profile);
  }, [adminOverview, adminUser, profile, shoots]);

  const tableShoots = adminUser && activeTab === "all" ? adminOverview?.allShoots ?? [] : shoots;
  const showOwnerColumn = adminUser && activeTab === "all";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Operasyon görünümü</h1>
          <p className="mt-2 text-sm text-slate-500">
            Çekim üretimi, kredi kullanımı ve son hareketler tek panelde.
          </p>
          {adminUser ? (
            <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Admin görünümü aktif
            </p>
          ) : null}
        </div>

        <Link href="/dashboard/yeni-cekim" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Yeni Çekim Oluştur
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {authLoading || loading || (adminUser && adminLoading)
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 w-full" />)
          : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      {adminUser ? (
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Çekim görünümü</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Kendi kayıtlarınızı veya tüm platform çekimlerini inceleyin.</p>
            </div>

            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("own")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeTab === "own" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Benim Çekimlerim
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeTab === "all" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tüm Çekimler
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {adminError ? <p className="mb-4 text-sm text-rose-500">{adminError}</p> : null}
            {adminLoading && !adminOverview ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ShootTable shoots={tableShoots} showOwner={showOwnerColumn} />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Son çekimler</CardTitle>
              <p className="mt-1 text-sm text-slate-500">En güncel üretim kayıtlarınız</p>
            </div>
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-72 w-full" /> : <ShootTable shoots={shoots.slice(0, 5)} />}</CardContent>
        </Card>
      )}

      {adminUser && adminOverview ? (
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Platform istatistikleri</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Bekleyen çekim</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{adminOverview.stats.processingShoots}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Hazır çekim</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{adminOverview.stats.readyShoots}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Hatalı çekim</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{adminOverview.stats.failedShoots}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
