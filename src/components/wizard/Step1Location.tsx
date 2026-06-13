"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, MapPinned } from "lucide-react";

import { PropertyMap } from "@/components/dashboard/PropertyMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DISTRICTS_BY_PROVINCE, TURKEY_PROVINCES } from "@/lib/turkey";
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
};

export function Step1Location({ onNext }: { onNext: () => void }) {
  const { data, patchData } = useWizardStore();
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const hasMounted = useRef(false);
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

  const onSubmit = async (values: FormValues) => {
    setIsValidating(true);
    setError(null);

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

      const payload = (await response.json()) as AnalysisPayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Konum doğrulanamadı.");
      }

      patchData({
        ...values,
        coordinates: payload.coordinates,
        neighborhoodSummary: payload.neighborhoodSummary ?? payload.summary ?? "",
        validatedLocation: true
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Konum doğrulanamadı.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Ada-parsel doğrulaması sonrası koordinat ve mahalle özeti otomatik çıkarılır. Sonraki adımda AI seslendirme ve
            yakın çevre etiketleri bu veriyi kullanır.
          </div>

          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

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

      <Card className="overflow-hidden rounded-[2rem] border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPinned className="h-5 w-5 text-primary" />
            Harita Önizleme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValidating ? <Skeleton className="aspect-video w-full rounded-[1.5rem]" /> : null}
          {!isValidating ? (
            <PropertyMap
              coordinates={data.coordinates}
              title={`Ada ${data.adaNo || "?"} / Parsel ${data.parselNo || "?"}`}
            />
          ) : null}
          <p className="text-sm text-slate-500">
            Mapbox 3D görünümü doğrulanan koordinatla güncellenir. Çekim rotası bir sonraki adımlarda bu konuma göre
            kişiselleştirilir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
