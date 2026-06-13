"use client";

import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

import { droneFlightAnimation } from "@/lib/animations/drone-flight";
import { cn } from "@/lib/utils";

const defaultSteps = [
  "Parsel verisi doğrulanıyor",
  "AI kamera rotası hazırlanıyor",
  "Yakın çevre etiketleri işleniyor",
  "Videonuz render kuyruğuna alındı"
];

export function ProcessingOverlay({
  open,
  steps = defaultSteps
}: {
  open: boolean;
  steps?: string[];
}) {
  const [activeStep, setActiveStep] = useState(0);
  const safeSteps = useMemo(() => (steps.length ? steps : defaultSteps), [steps]);

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current < safeSteps.length - 1 ? current + 1 : current));
    }, 700);

    return () => window.clearInterval(interval);
  }, [open, safeSteps.length]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/10 p-8 text-white shadow-2xl"
          >
            <div className="mx-auto max-w-sm">
              <Lottie animationData={droneFlightAnimation} loop className="h-56 w-full" />
            </div>

            <div className="mt-2 text-center">
              <h2 className="text-3xl font-semibold">Videonuz hazırlanıyor...</h2>
              <p className="mt-3 text-sm text-slate-300">
                AI çekim rotası, seslendirme ve teslim paketi arka planda hazırlanıyor.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {safeSteps.map((step, index) => {
                const completed = index < activeStep;
                const current = index === activeStep;

                return (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300",
                      completed || current ? "border-primary/40 bg-primary/10" : "border-white/10 bg-white/5"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : current ? (
                      <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-white/20" />
                    )}
                    <span className={cn("text-sm", completed || current ? "text-white" : "text-slate-300")}>{step}</span>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-sm text-slate-300">E-posta bilgilendirmesi alacaksınız.</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
