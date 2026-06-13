import Link from "next/link";
import { Check, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { landingPricing } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="fiyatlar" className="bg-white py-20 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Fiyatlandırma</p>
          <h2 className="section-heading mt-4">Her portföy hacmine uygun net çekim paketleri</h2>
          <p className="section-copy mx-auto mt-4">
            Tek çekim mantığıyla ilerleyin, ihtiyaç arttıkça profesyonel ya da kurumsal seviyeye geçin.
          </p>
        </div>

        <div className="mt-14 grid gap-6 xl:grid-cols-3">
          {landingPricing.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "glass-card-light relative flex h-full flex-col p-6 transition-all duration-300 hover:scale-105",
                plan.highlighted && "border-primary shadow-2xl shadow-primary/15"
              )}
            >
              {plan.badge ? (
                <span className="absolute right-6 top-6 rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-[0.18em] text-secondary-foreground">
                  {plan.badge}
                </span>
              ) : null}
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{plan.name}</p>
                <h3 className="mt-4 text-4xl font-semibold text-slate-900">{plan.price}</h3>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                        feature.included ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {feature.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </span>
                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={plan.name === "Kurumsal" ? "/iletisim" : "/kayit"}
                  className={cn(
                    buttonVariants({
                      variant: plan.highlighted ? "secondary" : "default",
                      size: "lg"
                    }),
                    "w-full"
                  )}
                >
                  {plan.name === "Kurumsal" ? "Teklif Al" : "Paketi Seç"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
