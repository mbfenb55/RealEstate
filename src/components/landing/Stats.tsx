"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import { landingStats } from "@/lib/landing-data";

function AnimatedCounter({
  value,
  prefix = "",
  suffix = ""
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplayValue(Math.round(progress * value));

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue.toLocaleString("tr-TR")}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {landingStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.45 }}
              className="glass-card-light p-6 text-center transition-all duration-300 hover:scale-105"
            >
              <p className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={"prefix" in stat ? stat.prefix : ""}
                  suffix={"suffix" in stat ? stat.suffix : ""}
                />
              </p>
              <p className="mt-3 text-sm font-medium text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
