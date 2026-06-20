import { CTABanner } from "@/components/landing/CTABanner";
import { FAQ } from "@/components/landing/FAQ";
import { Pricing } from "@/components/landing/Pricing";
import { getAppUrl } from "@/lib/env";

const appUrl = getAppUrl();

export const metadata = {
  title: "Fiyatlar | Parselim",
  description: "399 TL'den baslayan fiyatlarla sanal drone cekimi ve 3D sanal tur. Ilk cekim ucretsiz.",
  alternates: { canonical: `${appUrl}/fiyatlar` }
};

export default function PricingPage() {
  return (
    <main>
      <section className="container py-16">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Fiyatlar</p>
          <h1 className="section-heading">Ilan hacminize gore olceklenen kredi paketleri</h1>
          <p className="section-copy">
            Aylik planlarla duzenli uretim yapin ya da yuksek hacimli kurumsal akislar icin ozel sozlesme baslatin.
          </p>
        </div>
      </section>
      <Pricing />
      <FAQ />
      <CTABanner />
    </main>
  );
}
