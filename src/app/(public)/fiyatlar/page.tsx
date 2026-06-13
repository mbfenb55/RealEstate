export const metadata = {
  title: "Fiyatlar | Parselim",
  description: "399 TL'den başlayan fiyatlarla sanal drone çekimi ve 3D sanal tur. İlk çekim ücretsiz.",
  alternates: { canonical: "https://parselim.com/fiyatlar" }
};

import { CTABanner } from "@/components/landing/CTABanner";
import { FAQ } from "@/components/landing/FAQ";
import { Pricing } from "@/components/landing/Pricing";

export default function PricingPage() {
  return (
    <main>
      <section className="container py-16">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Fiyatlar</p>
          <h1 className="section-heading">İlan hacminize göre ölçeklenen kredi paketleri</h1>
          <p className="section-copy">
            Aylık planlarla düzenli üretim yapın ya da yüksek hacimli kurumsal akışlar için özel sözleşme başlatın.
          </p>
        </div>
      </section>
      <Pricing />
      <FAQ />
      <CTABanner />
    </main>
  );
}
