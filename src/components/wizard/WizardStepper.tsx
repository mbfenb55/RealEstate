"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = [
  { label: "Konum", description: "Ada, parsel ve ilçe seçimi" },
  { label: "Çekim Türü", description: "Paket ve teslimat tipi" },
  { label: "Özelleştirme", description: "Logo, marka ve seslendirme" },
  { label: "Etiketler", description: "Yakın çevre ve özel noktalar" },
  { label: "Onay", description: "Kredi veya güvenli ödeme" }
];

export function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <div key={step.label} className="flex flex-1 items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                    completed
                      ? "border-primary bg-primary text-white"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {completed ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                {index < steps.length - 1 ? (
                  <div className="mt-2 h-10 w-px bg-slate-200 lg:hidden" />
                ) : null}
              </div>

              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", active || completed ? "text-slate-900" : "text-slate-500")}>
                  {step.label}
                </p>
                <p className="mt-1 text-sm text-slate-500">{step.description}</p>
              </div>

              {index < steps.length - 1 ? (
                <div className="hidden h-px flex-1 bg-slate-200 lg:mt-5 lg:block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
