"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Building2, Map, MessageSquareShare, Mic2, PlaneTakeoff } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { featureTabs } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const iconMap = {
  kamera: PlaneTakeoff,
  etiketler: Map,
  marka: Building2,
  seslendirme: Mic2,
  paylasim: MessageSquareShare,
  analiz: BarChart3
};

export function Features() {
  const [activeId, setActiveId] = useState<(typeof featureTabs)[number]["id"]>(featureTabs[0].id);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const activeTab = featureTabs.find((item) => item.id === activeId) ?? featureTabs[0];
  const ActiveIcon = iconMap[activeTab.id];

  return (
    <section id="ozellikler" className="bg-white py-20 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Özellikler</p>
          <h2 className="section-heading mt-4">Tüm üretim akışını yöneten akıllı araç seti</h2>
          <p className="section-copy mx-auto mt-4">
            Kamera rotasından paylaşım linkine kadar her aşamayı danışmanın iş akışına yakın tutan sade bir deneyim.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass-card-light p-3">
              {featureTabs.map((item) => {
                const Icon = iconMap[item.id];
                const active = item.id === activeId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-[1.5rem] px-4 py-4 text-left transition-all duration-300",
                      active ? "bg-primary text-white shadow-lg shadow-primary/15" : "hover:bg-slate-100"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl",
                        active ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn("font-semibold", active ? "text-white" : "text-slate-900")}>{item.title}</p>
                      <p className={cn("mt-1 text-sm leading-6", active ? "text-slate-100" : "text-slate-500")}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            {!hydrated ? (
              <div className="glass-card-light space-y-4 p-6">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="glass-card-light overflow-hidden p-6 sm:p-8"
                >
                  <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                        <ActiveIcon className="h-4 w-4" />
                        {activeTab.accentLabel}
                      </div>
                      <h3 className="mt-5 text-3xl font-semibold text-slate-900">{activeTab.title}</h3>
                      <p className="mt-4 text-base leading-8 text-slate-600">{activeTab.description}</p>
                      <ul className="mt-6 space-y-3">
                        {activeTab.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="mt-2 h-2 w-2 rounded-full bg-secondary" />
                            <span className="leading-7">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-primary-dark to-primary p-5 text-white shadow-2xl shadow-primary/20">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-200">Canlı modül görünümü</p>
                            <p className="mt-2 text-2xl font-semibold">{activeTab.title}</p>
                          </div>
                          <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                            <p className="text-xs text-slate-300">Durum</p>
                            <p className="mt-1 text-lg font-semibold">Aktif</p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                          {activeTab.stats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl bg-white/10 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{stat.label}</p>
                              <p className="mt-3 text-xl font-semibold">{stat.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                          <p className="text-sm font-medium text-slate-100">Teslim akış özeti</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {["WhatsApp", "Instagram", "Sahibinden"].map((platform) => (
                              <span
                                key={platform}
                                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
