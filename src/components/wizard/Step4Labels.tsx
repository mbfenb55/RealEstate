"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Cross,
  GraduationCap,
  MapPin,
  ShoppingBag,
  TrainFront,
  Trees,
  UtensilsCrossed
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { NearbyLabelSelection, NearbyPlace } from "@/types";
import { useWizardStore } from "@/store/wizardStore";
import { cn } from "@/lib/utils";

const categoryOrder: NearbyPlace["category"][] = ["Ulaşım", "Eğitim", "Sağlık", "Alışveriş", "Parklar", "Restoranlar"];

const categoryIcons = {
  Ulaşım: TrainFront,
  Eğitim: GraduationCap,
  Sağlık: Cross,
  Alışveriş: ShoppingBag,
  Parklar: Trees,
  Restoranlar: UtensilsCrossed
} satisfies Record<NearbyPlace["category"], ComponentType<{ className?: string }>>;

type NearbyResponse = {
  nearby?: NearbyLabelSelection[];
  error?: string;
};

function formatDistance(distance: number) {
  if (distance < 1000) {
    return `${distance} m`;
  }

  return `${(distance / 1000).toFixed(1)} km`;
}

export function Step4Labels({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, toggleNearbyLabel, addCustomLabel, removeNearbyLabel } = useWizardStore();
  const [places, setPlaces] = useState<NearbyLabelSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const coordinatesKey = data.coordinates?.join(",") ?? "";

  useEffect(() => {
    if (!data.coordinates) {
      return;
    }

    let cancelled = false;

    const loadNearbyPlaces = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/analiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            intent: "nearby",
            coordinates: data.coordinates
          })
        });

        const payload = (await response.json()) as NearbyResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Yakın çevre verileri alınamadı.");
        }

        if (!cancelled) {
          setPlaces(payload.nearby ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Yakın çevre verileri alınamadı.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadNearbyPlaces();

    return () => {
      cancelled = true;
    };
  }, [coordinatesKey, data.coordinates]);

  const groupedPlaces = useMemo(
    () =>
      categoryOrder.map((category) => ({
        category,
        items: places.filter((item) => item.category === category)
      })),
    [places]
  );

  if (!data.coordinates) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Yakın çevre etiketlerini getirebilmemiz için önce konumu doğrulamanız gerekiyor.
        </div>
        <Button variant="outline" type="button" onClick={onBack}>
          Geri
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Seçili etiketler</p>
          <p className="mt-1 text-sm text-slate-500">En fazla 10 etiket seçebilirsiniz. Özel etiketler bu sınıra dahildir.</p>
        </div>
        <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          {data.nearbyLabels.length}/10 etiket seçildi
        </div>
      </div>

      {data.nearbyLabels.length ? (
        <div className="flex flex-wrap gap-2">
          {data.nearbyLabels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => removeNearbyLabel(item.id)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              {item.name}
              <span className="text-white/80">×</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-6">
        {loading
          ? categoryOrder.map((category) => (
              <div key={category} className="space-y-3">
                <Skeleton className="h-6 w-40 rounded-full" />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={`${category}-${index}`} className="h-28 rounded-[1.5rem]" />
                  ))}
                </div>
              </div>
            ))
          : groupedPlaces.map(({ category, items }) => {
              const CategoryIcon = categoryIcons[category];

              if (!items.length) {
                return null;
              }

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-slate-900">{category}</h3>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => {
                      const selected = data.nearbyLabels.some((label) => label.id === item.id);
                      const limitReached = data.nearbyLabels.length >= 10 && !selected;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={limitReached}
                          onClick={() => toggleNearbyLabel(item)}
                          className={cn(
                            "rounded-[1.5rem] border p-4 text-left transition-all duration-300",
                            selected
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-slate-200 bg-white hover:border-primary/40",
                            limitReached ? "cursor-not-allowed opacity-60" : "hover:scale-[1.02]"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {formatDistance(item.distanceMeters)}
                            </div>
                          </div>
                          <p className="mt-4 text-base font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.typeLabel}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
      </div>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      <Card className="rounded-[2rem] border-slate-200">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="custom-label">Özel etiket</Label>
            <p className="mt-1 text-sm text-slate-500">Örneğin “Marina’ya 6 dk” veya “Yeni imar aksına yakın”.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="custom-label"
              value={customLabel}
              placeholder="Özel etiket ekleyin"
              onChange={(event) => setCustomLabel(event.target.value)}
            />
            <Button
              type="button"
              disabled={!customLabel.trim() || data.nearbyLabels.length >= 10}
              onClick={() => {
                addCustomLabel(customLabel);
                setCustomLabel("");
              }}
            >
              Etiket Ekle
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" type="button" onClick={onBack}>
          Geri
        </Button>
        <Button type="button" onClick={onNext}>
          Ödeme ve Onaya Geç
        </Button>
      </div>
    </div>
  );
}
