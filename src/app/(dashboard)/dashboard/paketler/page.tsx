"use client";

import Link from "next/link";
import { BadgePercent, CreditCard, Sparkles } from "lucide-react";

import { PAYMENTS_ENABLED } from "@/lib/features";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const creditPackages = [
  {
    name: "1 Çekim",
    credits: 1,
    amount: 399,
    perShootPrice: 399,
    description: "Tek portföy için hızlı başlangıç.",
    badge: null
  },
  {
    name: "5 Çekim",
    credits: 5,
    amount: 1799,
    perShootPrice: 360,
    description: "Düzenli çekim yapan danışmanlar için daha ekonomik.",
    badge: "%10 Tasarruf"
  },
  {
    name: "10 Çekim",
    credits: 10,
    amount: 3299,
    perShootPrice: 330,
    description: "Ekip kullanımında en dengeli kredi paketi.",
    badge: "%18 Tasarruf"
  },
  {
    name: "25 Çekim",
    credits: 25,
    amount: 0,
    perShootPrice: 0,
    description: "Toplu kullanım, özel fiyat ve operasyon desteği.",
    badge: "Kurumsal"
  }
] as const;

export default function PackagesPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Paket Al</p>
          <h1 className="text-3xl font-semibold text-slate-900">Kredi paketleri</h1>
          <p className="max-w-3xl text-sm text-slate-500">
            Ödeme sistemi canlıya alınana kadar pasif. Şimdilik mevcut kredilerinizle çekim üretmeye devam edin.
          </p>
        </div>

        <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          Mevcut kredi: {profile?.credits ?? 0}
        </div>
      </div>

      {!PAYMENTS_ENABLED ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ödeme akışı geçici olarak pasif. Canlıya geçtiğimizde paket satın alma ve kartla ödeme tekrar aktif olacak.
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {creditPackages.map((plan) => (
          <Card key={plan.name} className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-primary">{plan.credits} kredi</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{plan.name}</h2>
                </div>
                {plan.badge ? (
                  <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                    {plan.badge}
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">{plan.description}</p>

              <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Toplam tutar</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {plan.amount ? formatCurrency(plan.amount) : "Özel Fiyat"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {plan.perShootPrice ? `${formatCurrency(plan.perShootPrice)} / çekim` : "Toplu anlaşma fiyatı"}
                </p>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {PAYMENTS_ENABLED ? "İyzico ile güvenli ödeme" : "Ödeme akışı pasif"}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {PAYMENTS_ENABLED ? "Krediler ödeme sonrasında otomatik yüklenir" : "Canlıda otomatik kredi yükleme açılacak"}
                </div>
                {plan.badge ? (
                  <div className="flex items-center gap-2">
                    <BadgePercent className="h-4 w-4 text-primary" />
                    Avantajlı birim çekim maliyeti
                  </div>
                ) : null}
              </div>

              <div className="mt-auto pt-6">
                {plan.name === "25 Çekim" ? (
                  <Link href="/iletisim?paket=kurumsal" className="inline-flex w-full">
                    <Button type="button" variant="outline" className="w-full">
                      Teklif Al
                    </Button>
                  </Link>
                ) : (
                  <Button type="button" className="w-full" disabled={!PAYMENTS_ENABLED}>
                    {PAYMENTS_ENABLED ? "Satın Al" : "Yakında Aktif"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
