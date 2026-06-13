export const metadata = {
  title: "Hakkımızda | Terramony",
  description: "Terramony, Türkiye'nin yapay zeka destekli emlak görselleştirme platformudur.",
  alternates: { canonical: "https://terramony.com/hakkimizda" }
};

import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="container py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Hakkımızda</p>
        <h1 className="section-heading">Drone üretimini daha ölçülebilir ve daha hızlı hale getiriyoruz</h1>
        <p className="section-copy">
          Drone360 Türkiye, emlak danışmanları, proje geliştiriciler ve arsa yatırım ekipleri için yapay zeka destekli
          içerik üretimi altyapısı sunar.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Misyon",
            body: "Saha çekimlerini, analiz ve satış anlatısını tek platformda birleştirerek ekiplerin üretim hızını artırmak."
          },
          {
            title: "Yaklaşım",
            body: "Türkiye pazarına uygun ödeme, Türkçe seslendirme, yerel harita içgörüleri ve operasyon odaklı panel tasarımı."
          },
          {
            title: "Kimler için",
            body: "Bireysel danışmanlardan kurumsal geliştiricilere kadar görsel sunumu gelir kaldıraç olarak kullanan ekipler."
          }
        ].map((item) => (
          <Card key={item.title} className="rounded-[2rem]">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
