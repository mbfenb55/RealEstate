export const metadata = {
  title: "Parselim | AI Destekli Sanal Drone Çekimi & 3D Sanal Tur",
  description:
    "Ada-parsel numaranızı girin, 10 dakikada profesyonel drone videosu ve 3D sanal tur hazırlayın. Türkiye'nin #1 AI emlak görselleştirme platformu.",
  keywords: "sanal drone çekimi, 3D sanal tur, emlak videosu, arsa analizi, yapay zeka emlak",
  openGraph: {
    title: "Parselim | AI Destekli Sanal Drone Çekimi",
    description: "10 dakikada profesyonel emlak videosu. Ada-parsel ile anında oluştur.",
    url: "https://parselim.com",
    siteName: "Parselim",
    locale: "tr_TR",
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "Parselim", description: "AI destekli sanal drone çekimi" },
  alternates: { canonical: "https://parselim.com" }
};

import { CTABanner } from "@/components/landing/CTABanner";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Services } from "@/components/landing/Services";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";

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
            description: "AI destekli sanal drone çekimi ve 3D sanal tur platformu",
            url: "https://parselim.com",
            telephone: "+90-212-000-0000",
            address: {
              "@type": "PostalAddress",
              addressLocality: "İstanbul",
              addressCountry: "TR"
            },
            priceRange: "₺₺",
            serviceArea: { "@type": "Country", name: "Türkiye" }
          })
        }}
      />
    </>
  );
}
