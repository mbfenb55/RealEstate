"use client";

import { motion } from "framer-motion";
import { Bot, MapPinned, Video } from "lucide-react";

const steps = [
  {
    icon: MapPinned,
    title: "Ada-Parsel Numarasını Gir",
    description: "Parsel bilgisiyle çekim akışını ve lokasyon bazlı içerik üretimini başlatın."
  },
  {
    icon: Bot,
    title: "AI Kamera Rotasını Oluşturur",
    description: "Yapay zeka sahne akışını, kamera açılarını ve etiket planını otomatik hazırlar."
  },
  {
    icon: Video,
    title: "10 Dakikada Video Hazır",
    description: "Türkçe seslendirme, marka alanları ve paylaşım linki ile profesyonel teslim alın."
  }
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="bg-slate-50 py-20 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Nasıl Çalışır</p>
          <h2 className="section-heading mt-4">Üç net adımda ilandan profesyonel dijital sunuma geçin</h2>
          <p className="section-copy mx-auto mt-4">
            Süreç danışmanın hızını düşürmeden ilerler. Veri girişi, rota oluşturma ve teslim akışı otomatik birleşir.
          </p>
        </div>

        <div className="relative mt-16">
          <motion.div
            className="absolute bottom-10 left-7 top-10 block w-px origin-top bg-gradient-to-b from-primary via-secondary to-primary md:hidden"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9 }}
          />
          <motion.div
            className="absolute left-[18%] top-14 hidden h-px w-[64%] origin-left bg-gradient-to-r from-primary via-secondary to-primary md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1 }}
          />

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.12, duration: 0.55 }}
                className="relative flex gap-4 md:block"
              >
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="glass-card-light flex-1 p-6 md:mt-6">
                  <p className="text-sm font-semibold text-secondary">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
