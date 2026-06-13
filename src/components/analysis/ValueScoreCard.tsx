"use client";

import { motion } from "framer-motion";
import { Bus, Cross, School, ShoppingCart, Trees, UtensilsCrossed } from "lucide-react";

import type { OverpassPlace, ScoreItem, ValueScoreResult } from "@/lib/value-score";
import { cn } from "@/lib/utils";

type ValueScoreCardProps = {
  valueScore: ValueScoreResult;
  nearbyPlaces: OverpassPlace[];
};

function scorePalette(score: number) {
  if (score <= 30) {
    return { ring: "#EF4444", text: "text-red-500", bg: "bg-red-50", border: "border-red-200" };
  }

  if (score <= 60) {
    return { ring: "#F97316", text: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" };
  }

  if (score <= 80) {
    return { ring: "#22C55E", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  }

  return { ring: "#D4AF37", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function placeIcon(place: OverpassPlace) {
  switch (place.kind) {
    case "school":
      return <School className="h-4 w-4" />;
    case "hospital":
    case "pharmacy":
      return <Cross className="h-4 w-4" />;
    case "supermarket":
      return <ShoppingCart className="h-4 w-4" />;
    case "park":
      return <Trees className="h-4 w-4" />;
    case "restaurant":
      return <UtensilsCrossed className="h-4 w-4" />;
    case "metro":
    case "tram":
    case "bus":
    default:
      return <Bus className="h-4 w-4" />;
  }
}

function ScoreRing({ score }: { score: number }) {
  const palette = scorePalette(score);
  const size = 132;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="relative flex h-[132px] w-[132px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148,163,184,0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.ring}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-semibold", palette.text)}>{score}</span>
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">/100</span>
      </div>
    </div>
  );
}

function BreakdownRow({ item }: { item: ScoreItem }) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm transition-all duration-300",
        item.active ? "border-slate-200 bg-white" : "border-dashed border-slate-200 bg-slate-50 text-slate-500"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-slate-900">{item.label}</p>
        <span className={cn("text-sm font-semibold", item.points > 0 ? "text-emerald-600" : "text-slate-400")}>
          +{item.points}
        </span>
      </div>
      <p className="mt-1 text-xs leading-5">{item.details}</p>
    </div>
  );
}

export function ValueScoreCard({ valueScore, nearbyPlaces }: ValueScoreCardProps) {
  const palette = scorePalette(valueScore.score);
  const visiblePlaces = nearbyPlaces.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={cn("rounded-[1.5rem] border p-5 shadow-sm", palette.border, palette.bg)}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <ScoreRing score={valueScore.score} />
            <div className="space-y-2">
              <p className={cn("text-sm font-semibold uppercase tracking-[0.2em]", palette.text)}>Değer Skoru</p>
              <h3 className="text-2xl font-semibold text-slate-900">{valueScore.label}</h3>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Yakın çevredeki ulaşım, eğitim, sağlık ve sosyal alanlar dikkate alınarak lokasyon potansiyeli
                değerlendirildi.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Puan kırılımı</h4>
            <div className="space-y-3">
              {valueScore.breakdown.map((item) => (
                <BreakdownRow key={item.key} item={item} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Yakın çevre</h4>
            {visiblePlaces.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {visiblePlaces.map((place) => (
                  <div key={place.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">{placeIcon(place)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{place.name}</p>
                      <p className="text-xs text-slate-500">{place.typeLabel}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">{place.category}</span>
                        <span>{formatDistance(place.distanceMeters)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                Bu konum için yakın çevre verisi bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
