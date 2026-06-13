import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { mapShootToRecord } from "@/lib/shoots";
import { formatDate } from "@/lib/utils";

export default async function PublicSharePage({ params }: { params: { token: string } }) {
  const shoot = await prisma.shoot.findUnique({
    where: {
      publicToken: params.token
    }
  });

  if (!shoot) {
    notFound();
  }

  const mappedShoot = mapShootToRecord(shoot);
  const analysis = mappedShoot.landAnalysis;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-secondary">Drone360 Paylaşım</p>
          <h1 className="text-4xl font-semibold">{`Ada ${shoot.adaNo} / Parsel ${shoot.parselNo}`}</h1>
          <p className="text-slate-300">
            {shoot.ilce}, {shoot.il} • {formatDate(shoot.createdAt.toISOString())}
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          {mappedShoot.videoUrl ? (
            <video controls className="aspect-video w-full bg-black object-cover" preload="metadata" src={mappedShoot.videoUrl} />
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-slate-300">Video hazırlanıyor...</div>
          )}
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Lokasyon Özeti</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{analysis?.summary}</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Hızlı Bilgiler</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div>
                <p className="text-slate-400">İmar Durumu</p>
                <p className="mt-1 font-medium text-white">{analysis?.zoningStatus}</p>
              </div>
              <div>
                <p className="text-slate-400">m²</p>
                <p className="mt-1 font-medium text-white">{analysis?.areaSqm?.toLocaleString("tr-TR") ?? "-"}</p>
              </div>
              <div>
                <p className="text-slate-400">Yakın Nokta</p>
                <p className="mt-1 font-medium text-white">{analysis?.nearbyPois?.length ?? 0} kayıt</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
