"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrainCircuit, Loader2, RefreshCcw, ScanSearch } from "lucide-react";

import { ParcelCoordinateTable } from "@/components/parcel/ParcelCoordinateTable";
import { KmlUploadCard } from "@/components/parcel/KmlUploadCard";
import { ParcelMap } from "@/components/parcel/ParcelMap";
import { ParcelMarketingPanel } from "@/components/parcel/ParcelMarketingPanel";
import { ParcelMetricsCards } from "@/components/parcel/ParcelMetricsCards";
import { ParcelVisualPrompts } from "@/components/parcel/ParcelVisualPrompts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ParcelAnalysisRecord } from "@/types/parcel";

type ParcelApiResponse = {
  message?: string;
  error?: string;
  item?: ParcelAnalysisRecord;
};

function formatBounds(analysis: ParcelAnalysisRecord) {
  return `${analysis.bbox.south.toFixed(4)}, ${analysis.bbox.west.toFixed(4)} / ${analysis.bbox.north.toFixed(4)}, ${analysis.bbox.east.toFixed(4)}`;
}

export default function ParcelUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parcelId = searchParams.get("id");
  const [analysis, setAnalysis] = useState<ParcelAnalysisRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(Boolean(parcelId));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileName = analysis?.originalFileName ?? null;

  const loadAnalysis = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setError(null);

    try {
      const response = await fetch(`/api/parsel/${id}`, {
        cache: "no-store"
      });
      const payload = (await response.json().catch(() => null)) as ParcelApiResponse | null;

      if (!response.ok || !payload?.item) {
        throw new Error(payload?.error ?? "Parsel detayi alinamadi.");
      }

      setAnalysis(payload.item);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Parsel detayi alinamadi.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const runAiAnalysis = useCallback(async (id: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/parsel/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });
      const payload = (await response.json().catch(() => null)) as ParcelApiResponse | null;

      if (!response.ok || !payload?.item) {
        throw new Error(payload?.error ?? "AI analizi olusturulamadi.");
      }

      setAnalysis(payload.item);
      setMessage(payload.message ?? "Pazarlama analizi tamamlandi.");
    } catch (analyzeError) {
      setError(
        analyzeError instanceof Error
          ? analyzeError.message
          : "AI analizi sirasinda beklenmeyen bir hata olustu."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parsel/upload-kml", {
          method: "POST",
          body: formData
        });
        const payload = (await response.json().catch(() => null)) as ParcelApiResponse | null;

        if (!response.ok || !payload?.item) {
          throw new Error(payload?.error ?? "KML dosyasi yuklenemedi.");
        }

        setAnalysis(payload.item);
        setMessage(payload.message ?? "Parsel basariyla analiz edildi.");
        router.replace(`/dashboard/parsel-yukle?id=${payload.item.id}`, { scroll: false });
        await runAiAnalysis(payload.item.id);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "KML yuklenemedi.");
      } finally {
        setIsUploading(false);
      }
    },
    [router, runAiAnalysis]
  );

  useEffect(() => {
    if (!parcelId) {
      setIsLoadingDetail(false);
      return;
    }

    void loadAnalysis(parcelId);
  }, [loadAnalysis, parcelId]);

  const showPlaceholder = useMemo(() => !analysis && !isLoadingDetail, [analysis, isLoadingDetail]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Parsel Yukleme</p>
          <h1 className="text-3xl font-semibold text-slate-900">KML tabanli yapay zeka destekli parsel analizi</h1>
          <p className="max-w-3xl text-sm text-slate-500">
            KML dosyanizi yukleyin; sistem GeoJSON donusumu, harita cizimi, alan ve koordinat
            hesaplari ile pazarlama iceriklerini tek akista hazirlasin.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => (analysis ? void runAiAnalysis(analysis.id) : undefined)}
          disabled={!analysis || isUploading || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analiz Uretiliyor
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              AI Analizini Yenile
            </>
          )}
        </Button>
      </div>

      {message ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <KmlUploadCard
        onUpload={handleUpload}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
        fileName={fileName}
        error={error}
      />

      {isLoadingDetail ? (
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="flex items-center justify-center gap-3 p-10 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Kayitli parsel analizi yukleniyor...
          </CardContent>
        </Card>
      ) : null}

      {analysis ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="rounded-[2rem] border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Harita Gosterimi</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Polygon siniri kirmizi olarak cizilir, merkez nokta otomatik isaretlenir.
                </p>
              </CardHeader>
              <CardContent>
                <ParcelMap
                  geojson={analysis.geojson}
                  centroidLat={analysis.centroidLat}
                  centroidLng={analysis.centroidLng}
                />
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Analiz Ozeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dosya</p>
                  <p className="mt-2 font-medium text-slate-900">{analysis.originalFileName}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Geometri</p>
                  <p className="mt-2 font-medium text-slate-900">{analysis.geometryType}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bounding Box</p>
                  <p className="mt-2 leading-6 text-slate-900">{formatBounds(analysis)}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Olusturulma</p>
                  <p className="mt-2 font-medium text-slate-900">{formatDate(analysis.createdAt)}</p>
                </div>
                <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4">
                  <p className="flex items-center gap-2 font-medium text-primary">
                    <ScanSearch className="h-4 w-4" />
                    Sistem ciktilari
                  </p>
                  <p className="mt-2 leading-6 text-slate-600">
                    Alan, cevre, centroid, bbox, koordinat tablosu ve AI pazarlama metinleri ayni
                    kayitta saklanir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <ParcelMetricsCards analysis={analysis} />
          <ParcelCoordinateTable points={analysis.cornerPoints} />
          <ParcelMarketingPanel analysis={analysis} />
          <ParcelVisualPrompts prompts={analysis.visualPrompts} />
        </>
      ) : null}

      {showPlaceholder ? (
        <Card className="rounded-[2rem] border-dashed border-slate-300 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Henüz bir parsel secilmedi</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Ilk KML dosyanizi yuklediginizde harita, metrik kartlari, koordinat tablosu ve
                pazarlama metinleri bu sayfada otomatik belirecek.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
