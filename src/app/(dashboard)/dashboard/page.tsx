"use client";

import Link from "next/link";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { ShootTable } from "@/components/dashboard/ShootTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useShoots } from "@/hooks/useShoots";
import { getDashboardMetrics } from "@/lib/dashboard";

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { shoots, loading } = useShoots();
  const metrics = getDashboardMetrics(shoots, profile);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Operasyon görünümü</h1>
          <p className="mt-2 text-sm text-slate-500">
            Çekim üretimi, kredi kullanımı ve son hareketler tek panelde.
          </p>
        </div>

        <Link href="/dashboard/yeni-cekim" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Yeni Çekim Oluştur
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {authLoading || loading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 w-full" />)
          : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Son çekimler</CardTitle>
            <p className="mt-1 text-sm text-slate-500">En güncel üretim kayıtlarınız</p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-72 w-full" /> : <ShootTable shoots={shoots.slice(0, 5)} />}
        </CardContent>
      </Card>
    </div>
  );
}
