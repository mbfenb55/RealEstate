"use client";

import { CheckCircle2, Cuboid, Plane, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCreditAmount, SHOOT_OPTIONS } from "@/lib/shoot-options";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizardStore";

const iconMap = {
  DRONE: Plane,
  TOUR_3D: Cuboid,
  COMBO: Sparkles
} as const;

export function Step2ShootType({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, patchData } = useWizardStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {SHOOT_OPTIONS.map((option) => {
          const active = data.shootType === option.type;
          const Icon = iconMap[option.type];

          return (
            <button
              key={option.type}
              type="button"
              onClick={() =>
                patchData({
                  shootType: option.type,
                  estimatedCredits: option.credits,
                  orderAmount: option.amount
                })
              }
              className={cn(
                "relative rounded-[2rem] border p-6 text-left transition-all duration-300 hover:scale-[1.02]",
                active ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-slate-200 bg-white hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  {option.badge ? <Badge variant="secondary">{option.badge}</Badge> : null}
                  {active ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                </div>
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-900">{option.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{formatCreditAmount(option.credits)} kredi</span>
                <span className="text-lg font-semibold text-slate-900">{option.amount.toLocaleString("tr-TR")} TL</span>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" type="button" onClick={onBack}>
          Geri
        </Button>
        <Button type="button" onClick={onNext}>
          Devam Et
        </Button>
      </div>
    </div>
  );
}
