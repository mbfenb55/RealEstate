"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChartColumnBig, Cuboid, Film, ScanSearch } from "lucide-react";

const services = [
  {
    title: "Sanal Drone Çekimi",
    icon: ScanSearch,
    description: "Ada ve parselden başlayan akışla profesyonel sanal drone videosu üretin."
  },
  {
    title: "3D Sanal Tur",
    icon: Cuboid,
    description: "Harita katmanları ve etiketlerle interaktif 3D tur deneyimi hazırlayın."
  },
  {
    title: "Arsa Analizi",
    icon: ChartColumnBig,
    description: "Yakınlık, lokasyon ve pazarlama potansiyelini kısa rapor halinde sunun."
  },
  {
    title: "Emlak Tanıtım Videosu",
    icon: Film,
    description: "Türkçe seslendirme ve marka alanlarıyla satışa hazır ilan videosu teslim edin."
  }
];

export function Services() {
  return (
    <section id="hizmetler" className="bg-dark-bg py-20 text-white sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Hizmetler</p>
          <h2 className="section-heading mt-4 text-white">Tek panelde video, 3D tur ve arsa anlatısı</h2>
          <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
            Gayrimenkul sunumunda gereken temel üretim parçalarını modüler değil, aynı operasyon akışı içinde yönetin.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.1, duration: 0.55 }}
              className="glass-panel p-6 transition-all duration-300 hover:scale-105"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-secondary">
                <service.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{service.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{service.description}</p>
              <Link
                href="/#ozellikler"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-all duration-300 hover:translate-x-1"
              >
                Detaylı İncele
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
