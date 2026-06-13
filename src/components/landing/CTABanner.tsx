import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTABanner() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="container">
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-primary-dark to-primary px-8 py-12 text-white shadow-2xl shadow-primary/20 sm:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Hemen Başlayın</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                İlk çekiminizi bugün oluşturun, ilan sunumunuzu 10 dakikada dijitalleştirin.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-200">
                Kredi kartı gerekmez. İlk çekim tamamen ücretsiz.
              </p>
            </div>

            <div className="shrink-0">
              <Link href="/kayit" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "px-8")}>
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
