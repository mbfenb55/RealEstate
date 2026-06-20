import { Card, CardContent } from "@/components/ui/card";
import { getAppUrl } from "@/lib/env";

const appUrl = getAppUrl();

export const metadata = {
  title: "Hakkimizda | Parselim",
  description: "Parselim, Turkiye'nin yapay zeka destekli emlak gorsellestirme platformudur.",
  alternates: { canonical: `${appUrl}/hakkimizda` }
};

export default function AboutPage() {
  return (
    <main className="container py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Hakkimizda</p>
        <h1 className="section-heading">Drone uretimini daha olculebilir ve daha hizli hale getiriyoruz</h1>
        <p className="section-copy">
          Parselim, emlak danismanlari, proje gelistiriciler ve arsa yatirim ekipleri icin yapay zeka destekli
          icerik uretimi altyapisi sunar.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Misyon",
            body: "Saha cekimlerini, analiz ve satis anlatisini tek platformda birlestirerek ekiplerin uretim hizini artirmak."
          },
          {
            title: "Yaklasim",
            body: "Turkiye pazarina uygun odeme, Turkce seslendirme, yerel harita icgoruleri ve operasyon odakli panel tasarimi."
          },
          {
            title: "Kimler icin",
            body: "Bireysel danismanlardan kurumsal gelistiricilere kadar gorsel sunumu gelir kaldirac olarak kullanan ekipler."
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
