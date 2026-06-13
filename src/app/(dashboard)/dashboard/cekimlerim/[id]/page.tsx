"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  GraduationCap,
  Share2,
  ShoppingBag,
  TrainFront,
  Trees,
  UtensilsCrossed,
  X
} from "lucide-react";

import { PropertyMap } from "@/components/dashboard/PropertyMap";
import { VideoPlayer } from "@/components/dashboard/VideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusBadgeVariant, getStatusLabel, getShootTypeLabel } from "@/lib/dashboard";
import { formatCurrency, formatDate, getShootById } from "@/lib/utils";
import type { NearbyPlace, ShootRecord } from "@/types";

const poiIcons = {
  Ulaşım: TrainFront,
  Eğitim: GraduationCap,
  Sağlık: CheckCircle2,
  Alışveriş: ShoppingBag,
  Parklar: Trees,
  Restoranlar: UtensilsCrossed
} satisfies Record<NearbyPlace["category"], ComponentType<{ className?: string }>>;

function createShareUrl(shoot: ShootRecord) {
  if (typeof window === "undefined") {
    return "";
  }

  const token = shoot.publicToken ?? shoot.id;
  return `${window.location.origin}/paylas/${token}`;
}

export default function ShootDetailPage({ params }: { params: { id: string } }) {
  const [shoot, setShoot] = useState<ShootRecord | null>(getShootById(params.id) ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [embedOpen, setEmbedOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadShoot = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cekim/${params.id}`, {
          cache: "no-store"
        });

        const payload = (await response.json()) as { item?: ShootRecord; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Çekim bilgisi alınamadı.");
        }

        if (!cancelled && payload.item) {
          setShoot(payload.item);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Çekim bilgisi alınamadı.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadShoot();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const shareUrl = useMemo(() => (shoot ? createShareUrl(shoot) : ""), [shoot]);
  const whatsappUrl = useMemo(() => {
    if (!shoot || !shareUrl) {
      return "";
    }

    const text = `${shoot.title} için hazırlanan sanal tur bağlantısı: ${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [shareUrl, shoot]);
  const embedCode = useMemo(
    () => `<iframe src="${shareUrl}" width="100%" height="720" frameborder="0" allowfullscreen></iframe>`,
    [shareUrl]
  );

  if (!shoot && !loading) {
    return (
      <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Çekim bulunamadı</h1>
        <p className="text-sm text-slate-500">{error ?? "Aradığınız çekim kaydı görüntülenemiyor."}</p>
        <Link href="/dashboard/cekimlerim" className="text-sm font-medium text-primary">
          Çekimlerime dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toast ? (
        <div className="fixed right-4 top-4 z-[110] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      ) : null}

      {embedOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Sahibinden Kodu</h2>
                <p className="mt-1 text-sm text-slate-500">Iframe kodunu kopyalayıp ilan açıklamanızda kullanabilirsiniz.</p>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setEmbedOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <textarea readOnly value={embedCode} className="min-h-[160px] w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-700" />
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(embedCode);
                  setToast("Embed kodu panoya kopyalandı.");
                }}
              >
                Kodu Kopyala
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Çekim Detayı</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{shoot?.title ?? "Çekim yükleniyor"}</h1>
          <p className="mt-2 text-sm text-slate-500">{shoot?.location}</p>
        </div>
        {shoot ? <Badge variant={getStatusBadgeVariant(shoot.status)}>{getStatusLabel(shoot.status)}</Badge> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Büyük Önizleme</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !shoot ? <Skeleton className="aspect-video rounded-[2rem]" /> : <VideoPlayer src={shoot?.videoUrl ?? shoot?.previewVideoUrl} />}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Çekim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Konum</span>
                <span className="font-medium text-slate-900">{shoot?.location}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Tarih</span>
                <span className="font-medium text-slate-900">{shoot ? formatDate(shoot.createdAt) : "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Tür</span>
                <span className="font-medium text-slate-900">{shoot ? getShootTypeLabel(shoot.type) : "-"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>İzlenme</span>
                <span className="font-medium text-slate-900">{shoot?.viewCount ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Harita Görünümü</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyMap coordinates={shoot?.coordinates} title={shoot?.title ?? "Çekim"} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Aksiyonlar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href={shoot?.videoUrl ?? shoot?.previewVideoUrl ?? "#"} download className="inline-flex">
            <Button type="button" disabled={!shoot?.videoUrl && !shoot?.previewVideoUrl}>
              <Download className="h-4 w-4" />
              MP4 İndir
            </Button>
          </a>

          <Button
            type="button"
            variant="outline"
            disabled={!shareUrl}
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              setToast("Paylaşım bağlantısı panoya kopyalandı.");
            }}
          >
            <Clipboard className="h-4 w-4" />
            Linki Kopyala
          </Button>

          <a href={whatsappUrl || "#"} target="_blank" rel="noreferrer" className="inline-flex">
            <Button type="button" variant="outline" disabled={!whatsappUrl}>
              <Share2 className="h-4 w-4" />
              WhatsApp&apos;ta Paylaş
            </Button>
          </a>

          <Button type="button" variant="outline" disabled={!shareUrl} onClick={() => setEmbedOpen(true)}>
            <ExternalLink className="h-4 w-4" />
            Sahibinden Kodu
          </Button>
        </CardContent>
      </Card>

      {shoot?.landAnalysis ? (
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Arsa Analizi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">m² Bilgisi</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{shoot.landAnalysis.areaSqm?.toLocaleString("tr-TR") ?? "-"}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">İmar Durumu</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{shoot.landAnalysis.zoningStatus ?? "-"}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Tahmini Değer Aralığı</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {shoot.landAnalysis.estimatedValueRange
                    ? `${formatCurrency(shoot.landAnalysis.estimatedValueRange.min)} - ${formatCurrency(
                        shoot.landAnalysis.estimatedValueRange.max
                      )}`
                    : "-"}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              {shoot.landAnalysis.summary}
            </div>

            {shoot.landAnalysis.nearbyPois?.length ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Yakın Çevre Noktaları</h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {shoot.landAnalysis.nearbyPois.map((poi) => {
                    const Icon = poiIcons[poi.category];

                    return (
                      <div key={poi.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {poi.distanceMeters < 1000 ? `${poi.distanceMeters} m` : `${(poi.distanceMeters / 1000).toFixed(1)} km`}
                          </span>
                        </div>
                        <p className="mt-4 text-base font-semibold text-slate-900">{poi.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{poi.typeLabel}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <a href={shoot.landAnalysis.reportPdfUrl ?? "#"} target="_blank" rel="noreferrer" className="inline-flex">
                <Button type="button" disabled={!shoot.landAnalysis.reportPdfUrl}>
                  <Download className="h-4 w-4" />
                  Tam Raporu İndir
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
