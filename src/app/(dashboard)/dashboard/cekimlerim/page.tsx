"use client";

import { ShootTable } from "@/components/dashboard/ShootTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useShoots } from "@/hooks/useShoots";

export default function ShootsPage() {
  const { shoots, loading } = useShoots();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Çekimlerim</p>
        <h1 className="text-3xl font-semibold text-slate-900">Tüm üretim kayıtlarınız</h1>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Çekim listesi</CardTitle>
        </CardHeader>
        <CardContent>{loading ? <Skeleton className="h-80 w-full" /> : <ShootTable shoots={shoots} />}</CardContent>
      </Card>
    </div>
  );
}
