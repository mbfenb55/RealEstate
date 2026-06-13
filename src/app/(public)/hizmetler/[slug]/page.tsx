import Link from "next/link";
import { notFound } from "next/navigation";

import { CTABanner } from "@/components/landing/CTABanner";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getServiceBySlug, services } from "@/lib/utils";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: "Hizmetler | Parselim",
      description: "Parselim hizmet detayları"
    };
  }

  return {
    title: `${service.title} | Parselim`,
    description: service.excerpt,
    alternates: { canonical: `https://parselim.com/hizmetler/${service.slug}` }
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <main>
      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Hizmet Detayı</p>
            <h1 className="section-heading">{service.title}</h1>
            <p className="section-copy">{service.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {service.highlights.map((highlight) => (
                <Card key={highlight} className="rounded-[2rem]">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Öne çıkan modül</p>
                    <p className="mt-2 text-lg font-semibold">{highlight}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="h-fit rounded-[2rem]">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">Başlangıç fiyatı</p>
              <p className="text-4xl font-semibold">{formatCurrency(service.priceFrom)}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Satışa hazır video tur, rapor özeti ve teslim bağlantısı dahildir.
              </p>
              <Link href="/dashboard/yeni-cekim" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
                Bu hizmetle başla
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
      <CTABanner />
    </main>
  );
}
