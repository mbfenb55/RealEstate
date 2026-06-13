import type { Metadata } from "next";

import { getAppUrl } from "@/lib/env";

/**
 * Public sayfalar için tekrar kullanılabilir metadata nesnesi üretir.
 */
export function buildPageMetadata(title: string, description: string): Metadata {
  return {
    metadataBase: new URL(getAppUrl()),
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "tr_TR",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

/**
 * Ana sayfada kullanılacak LocalBusiness JSON-LD verisini döndürür.
 */
export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Parselim",
    description:
      "Türkiye emlak pazarı için yapay zeka destekli sanal drone turu, 3D sanal tur ve arsa analiz platformu.",
    url: getAppUrl(),
    telephone: "+90 850 000 36 36",
    email: "destek@parselim.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
      addressLocality: "İstanbul",
      streetAddress: "Maslak"
    },
    areaServed: "Türkiye",
    priceRange: "₺₺",
    sameAs: []
  };
}
