import { CTABanner } from "@/components/landing/CTABanner";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Services } from "@/components/landing/Services";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { getAppUrl } from "@/lib/env";

const appUrl = getAppUrl();

export const metadata = {
  title: "Parselim | AI Destekli Sanal Drone Cekimi & 3D Sanal Tur",
  description:
    "Ada-parsel numaranizi girin, 10 dakikada profesyonel drone videosu ve 3D sanal tur hazirlayin. Turkiye'nin AI emlak gorsellestirme platformu.",
  keywords: "sanal drone cekimi, 3D sanal tur, emlak videosu, arsa analizi, yapay zeka emlak",
  openGraph: {
    title: "Parselim | AI Destekli Sanal Drone Cekimi",
    description: "10 dakikada profesyonel emlak videosu. Ada-parsel ile aninda olustur.",
    url: appUrl,
    siteName: "Parselim",
    locale: "tr_TR",
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "Parselim", description: "AI destekli sanal drone cekimi" },
  alternates: { canonical: appUrl }
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Services />
      <Features />
      <Stats />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Parselim",
            description: "AI destekli sanal drone cekimi ve 3D sanal tur platformu",
            url: appUrl,
            telephone: "+90-212-000-0000",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Istanbul",
              addressCountry: "TR"
            },
            priceRange: "TRY",
            serviceArea: { "@type": "Country", name: "Turkiye" }
          })
        }}
      />
    </>
  );
}
