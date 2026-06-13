"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, Sparkles, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { heroAvatars } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const particles = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  size: 6 + (index % 5) * 4,
  top: 8 + ((index * 11) % 78),
  left: 6 + ((index * 13) % 86),
  duration: 8 + (index % 4) * 2
}));

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white"
    >
      <div className="mesh-background absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_28%)]" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: particle.size,
            height: particle.size,
            top: `${particle.top}%`,
            left: `${particle.left}%`
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.25, 0.8, 0.25]
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
      ))}

      <div className="container relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-slate-100 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-secondary" />
            Türkiye genelinde dijital emlak sunumu
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Emlak İlanlarınızı AI ile Dijitalleştirin
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-xl"
          >
            Yapay Zeka destekli sanal drone çekimi ve 3D sanal tur. Ada-parsel numaranızı girin, 10 dakikada profesyonel videonuz hazır.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/kayit" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Ücretsiz Dene
            </Link>
            <Link
              href="/#ozellikler"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              )}
            >
              <PlayCircle className="h-5 w-5" />
              Demo İzle
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-14 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-[2rem] border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-md sm:flex-row sm:justify-between"
          >
            <div className="flex -space-x-3">
              {heroAvatars.map((avatar, index) => (
                <div
                  key={avatar}
                  className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-slate-900/80 shadow-lg"
                  style={{ zIndex: heroAvatars.length - index }}
                >
                  <Image src={avatar} alt="Danışman avatarı" fill sizes="48px" className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-100 sm:text-base">
              3.000+ Emlak Danışmanının Tercihi
            </p>
            <div className="flex items-center gap-1 text-secondary">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-12 max-w-4xl"
          >
            <div className="glass-panel mx-auto max-w-3xl p-4 sm:p-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 text-left">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Girdi</p>
                    <p className="mt-2 text-lg font-semibold">Ada 142 / Parsel 8</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Çıktı</p>
                    <p className="mt-2 text-lg font-semibold">Drone Video + 3D Tur</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Teslim Süresi</p>
                    <p className="mt-2 text-lg font-semibold">10 Dakika</p>
                  </div>
                </div>
                <div className="mt-4 rounded-3xl bg-gradient-to-r from-secondary/20 to-white/10 px-4 py-3 text-sm text-slate-100">
                  AI rota, Türkçe seslendirme ve paylaşım linki aynı akış içinde hazırlanır.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
