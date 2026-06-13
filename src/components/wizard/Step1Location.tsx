"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { centroid } from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, MapPinned } from "lucide-react";

import { ValueScoreCard } from "@/components/analysis/ValueScoreCard";
import { FileUpload } from "@/components/map/FileUpload";
import ParselMap from "@/components/map/ParselMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DISTRICTS_BY_PROVINCE, TURKEY_PROVINCES } from "@/lib/turkey";
import type { OverpassPlace, ValueScoreResult } from "@/lib/value-score";
import { useWizardStore } from "@/store/wizardStore";

const schema = z.object({
  adaNo: z.string().trim().regex(/^\d+$/, "Ada No yalnızca rakamlardan oluşmalıdır."),
  parselNo: z.string().trim().regex(/^\d+$/, "Parsel No yalnızca rakamlardan oluşmalıdır."),
  il: z.string().min(1, "İl seçimi zorunludur."),
  ilce: z.string().min(1, "İlçe seçimi zorunludur.")
});

type FormValues = z.infer<typeof schema>;
type AnalysisPayload = {
  coordinates?: [number, number];
  neighborhoodSummary?: string;
  summary?: string;
  error?: string;
};

type OverpassPayload = {
  nearbyPlaces?: OverpassPlace[];
  valueScore?: ValueScoreResult;
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readText(properties: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function readDigits(properties: Record<string, unknown>, ...keys: string[]) {
  const value = readText(properties, ...keys);
  const digits = value?.replace(/\D/g, "");
  return digits && digits.length > 0 ? digits : undefined;
}

function getFeatureProperties(feature: Feature) {
  return isRecord(feature.properties) ? feature.properties : {};
}

export function Step1Location({ onNext }: { onNext: () => void }) {
  const { data, patchData } = useWizardStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const hasMounted = useRef(false);
  const analysisRequestId = useRef(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      adaNo: data.adaNo,
      parselNo: data.parselNo,
      il: data.il,
      ilce: data.ilce
    }
  });

  const province = form.watch("il");
  const district = form.watch("ilce");
  const adaNo = form.watch("adaNo");
  const parselNo = form.watch("parselNo");
  const districts = useMemo(() => DISTRICTS_BY_PROVINCE[province] ?? [], [province]);

  const runOverpassAnalysis = useCallback(
    async (latitude: number, longitude: number) => {
      const requestId = ++analysisRequestId.current;
      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
        const response = await fetch("/api/analiz/overpass", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            latitude,
            longitude,
            radius: 1000
          })
        });

        const payload = (await response.json()) as OverpassPayload;

        if (!response.ok) {
          throw new Error(payload.error ?? "Yakın çevre analizi alınamadı.");
        }

        if (requestId !== analysisRequestId.current) {
          return;
        }

        patchData({
          nearbyPlaces: payload.nearbyPlaces ?? [],
          valueScore: payload.valueScore
        });
      } catch (error) {
        if (requestId !== analysisRequestId.current) {
          return;
        }

        const message = error instanceof Error ? error.message : "Yakın çevre analizi alınamadı.";
        setAnalysisError(message);
        patchData({
          nearbyPlaces: [],
          valueScore: undefined
        });
      } finally {
        if (requestId === analysisRequestId.current) {
          setIsAnalyzing(false);
        }
      }
    },
    [patchData]
  );

  useEffect(() => {
    if (!province) {
      form.setValue("ilce", "");
      return;
    }

    if (district && !districts.includes(district)) {
      form.setValue("ilce", "");
    }
  }, [district, districts, form, province]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    patchData({
      adaNo,
      parselNo,
      il: province,
      ilce: district,
      validatedLocation: false,
      coordinates: undefined,
      neighborhoodSummary: ""
    });
  }, [adaNo, parselNo, province, district, patchData]);

  const handleGeojsonLoaded = useCallback(
    (geojsonData: FeatureCollection, fileName?: string) => {
      patchData({
        uploadedGeojson: geojsonData,
        geojsonFileName: fileName ?? "",
        geojsonFeatureCount: geojsonData.features.length,
        validatedLocation: false,
        nearbyPlaces: [],
        valueScore: undefined
      });
      setFormError(null);
      setAnalysisError(null);
    },
    [patchData]
  );

  const handleFeatureSelect = useCallback(
    async (feature: Feature) => {
      const properties = getFeatureProperties(feature);
      const adaValue = readDigits(properties, "Ada", "ada", "AdaNo", "ADA");
      const parselValue = readDigits(properties, "ParselNo", "Parsel", "parsel", "PARSEL");
      const ilValue = readText(properties, "Il", "il", "İl", "IL");
      const ilceValue = readText(properties, "Ilce", "ilce", "İlce", "ILCE");
      const neighborhoodSummary =
        readText(properties, "Mahalle", "mahalle", "Mevkii", "mevkii") ?? data.neighborhoodSummary ?? "";

      if (adaValue) {
        form.setValue("adaNo", adaValue, { shouldDirty: true, shouldValidate: true });
      }

      if (parselValue) {
        form.setValue("parselNo", parselValue, { shouldDirty: true, shouldValidate: true });
      }

      if (ilValue) {
        form.setValue("il", ilValue, { shouldDirty: true, shouldValidate: true });
      }

      if (ilceValue) {
        form.setValue("ilce", ilceValue, { shouldDirty: true, shouldValidate: true });
      }

      const center = centroid(feature);
      const coordinates = center.geometry.coordinates as [number, number];

      patchData({
        adaNo: adaValue ?? form.getValues("adaNo"),
        parselNo: parselValue ?? form.getValues("parselNo"),
        il: ilValue ?? form.getValues("il"),
        ilce: ilceValue ?? form.getValues("ilce"),
        coordinates,
        validatedLocation: true,
        neighborhoodSummary
      });

      await runOverpassAnalysis(coordinates[1], coordinates[0]);
    },
    [data.neighborhoodSummary, form, patchData, runOverpassAnalysis]
  );

  const onSubmit = async (values: FormValues) => {
    setIsValidating(true);
    setFormError(null);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          intent: "validate",
          adaNo: values.adaNo,
          parselNo: values.parselNo,
          il: values.il,
          ilce: values.ilce
        })
      });

      const payload = (await response.json()) as AnalysisPayload;

      if (!response.ok) {
        throw new Error(payload.error ?? "Konum doğrulanamadı.");
      }

      patchData({
        ...values,
        coordinates: payload.coordinates,
        neighborhoodSummary: payload.neighborhoodSummary ?? payload.summary ?? "",
        validatedLocation: true
      });

      if (payload.coordinates) {
        await runOverpassAnalysis(payload.coordinates[1], payload.coordinates[0]);
      }
    } catch (submissionError) {
      setFormError(submissionError instanceof Error ? submissionError.message : "Konum doğrulanamadı.");
    } finally {
      setIsValidating(false);
    }
  };

  const uploadedGeojson = data.uploadedGeojson ?? undefined;
  const valueScore = data.valueScore;
  const nearbyPlaces = data.nearbyPlaces;
  const hasMapPin = typeof data.coordinates?.[0] === "number" && typeof data.coordinates?.[1] === "number";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adaNo">Ada No</Label>
              <Input
                id="adaNo"
                inputMode="numeric"
                placeholder="Örn. 124"
                {...form.register("adaNo", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, "");
                  }
                })}
              />
              <p className="text-sm text-rose-500">{form.formState.errors.adaNo?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parselNo">Parsel No</Label>
              <Input
                id="parselNo"
                inputMode="numeric"
                placeholder="Örn. 8"
                {...form.register("parselNo", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, "");
                  }
                })}
              />
              <p className="text-sm text-rose-500">{form.formState.errors.parselNo?.message}</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="il">İl</Label>
              <select
                id="il"
                className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                {...form.register("il")}
              >
                <option value="">İl seçin</option>
                {TURKEY_PROVINCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <p className="text-sm text-rose-500">{form.formState.errors.il?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ilce">İlçe</Label>
              <select
                id="ilce"
                className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                disabled={!province}
                {...form.register("ilce")}
              >
                <option value="">{province ? "İlçe seçin" : "Önce il seçin"}</option>
                {districts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <p className="text-sm text-rose-500">{form.formState.errors.ilce?.message}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Ada-parsel doğrulaması sonrasında koordinat ve mahalle özeti otomatik çıkarılır. Sonraki adımda AI
            seslendirme ve yakın çevre etiketleri bu veriyi kullanır.
          </div>

          {formError ? <p className="text-sm text-rose-500">{formError}</p> : null}

          {data.validatedLocation && data.coordinates ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
                <div className="space-y-2">
                  <p className="font-semibold">Konum doğrulandı</p>
                  <p>
                    Koordinatlar: {data.coordinates[1].toFixed(5)}, {data.coordinates[0].toFixed(5)}
                  </p>
                  <p className="text-emerald-900/80">{data.neighborhoodSummary || "Mahalle özeti hazırlanıyor."}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" variant="secondary" loading={isValidating} loadingText="Konum doğrulanıyor">
              Konumu Doğrula
            </Button>
            <Button type="button" onClick={onNext} disabled={!data.validatedLocation || !data.coordinates}>
              Devam Et
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <FileUpload
          onDataLoaded={handleGeojsonLoaded}
          initialFileName={data.geojsonFileName}
          initialFeatureCount={data.geojsonFeatureCount}
        />

        <Card className="overflow-hidden rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPinned className="h-5 w-5 text-primary" />
              Harita Önizleme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isValidating ? <Skeleton className="h-[420px] w-full rounded-[1.5rem]" /> : null}
            {!isValidating ? (
              <ParselMap
                geojsonData={uploadedGeojson}
                latitude={hasMapPin ? data.coordinates?.[1] : undefined}
                longitude={hasMapPin ? data.coordinates?.[0] : undefined}
                onParselSelect={handleFeatureSelect}
              />
            ) : null}
            <p className="text-sm leading-6 text-slate-500">
              Yüklenen parseller OpenStreetMap üzerinde görünür. Ada-parsel doğrulaması tamamlandığında pin de
              otomatik yerleşir.
            </p>
          </CardContent>
        </Card>

        {isAnalyzing ? (
          <Card className="rounded-[2rem] border-slate-200">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-28 w-full rounded-[1.5rem]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isAnalyzing && valueScore ? (
          <ValueScoreCard valueScore={valueScore} nearbyPlaces={nearbyPlaces} />
        ) : null}

        {!isAnalyzing && !valueScore ? (
          <Card className="rounded-[2rem] border-slate-200">
            <CardContent className="space-y-2 p-6 text-sm leading-6 text-slate-500">
              <p className="font-semibold text-slate-900">Değer skoru bekleniyor</p>
              <p>
                Bir GeoJSON/KML dosyası yükleyip harita üzerinde bir parsel seçtiğinizde veya konumu doğruladığınızda
                yakın çevre analizi burada görüntülenecek.
              </p>
              {analysisError ? <p className="text-rose-500">{analysisError}</p> : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
