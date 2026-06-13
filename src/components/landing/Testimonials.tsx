"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { testimonials } from "@/lib/landing-data";

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start"
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    setReady(true);

    const interval = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 4200);

    return () => window.clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Yorumlar</p>
          <h2 className="section-heading mt-4">Sahada kullanan danışmanlardan gelen gerçekçi geri bildirimler</h2>
        </div>

        {!ready ? (
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="glass-card-light space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-14 overflow-hidden" ref={emblaRef}>
          <div className="-ml-6 flex">
            {testimonials.map((item) => (
              <div key={item.name} className="min-w-0 flex-[0_0_100%] pl-6 md:flex-[0_0_50%] xl:flex-[0_0_33.333%]">
                <div className="glass-card-light h-full p-6 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200">
                      <Image src={item.avatar} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.title}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-secondary">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-600">“{item.quote}”</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
