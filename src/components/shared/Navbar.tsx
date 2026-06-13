"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { landingNavItems } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("#hero");

  useEffect(() => {
    const syncState = () => {
      setScrolled(window.scrollY > 12);
      setHash(window.location.hash || "#hero");
    };

    syncState();
    window.addEventListener("scroll", syncState, { passive: true });
    window.addEventListener("hashchange", syncState);

    return () => {
      window.removeEventListener("scroll", syncState);
      window.removeEventListener("hashchange", syncState);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  const activeHash = useMemo(() => (pathname === "/" ? hash || "#hero" : ""), [hash, pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-md transition-all duration-300",
          scrolled && "shadow-lg shadow-slate-900/5"
        )}
      >
        <div className="container flex h-20 items-center justify-between gap-4">
          <Link href="/#hero" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25">
              D
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Drone360 Türkiye</p>
              <p className="text-xs text-slate-500">AI Emlak Medya Platformu</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {landingNavItems.map((item) => {
              const active = activeHash === item.hash;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:text-primary",
                    active && "text-primary"
                  )}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-secondary"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/giris" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Giriş Yap
            </Link>
            <Link href="/kayit" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Ücretsiz Başla
            </Link>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label="Menüyü aç"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm bg-white p-6 shadow-2xl lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900">Menü</p>
                <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="mt-8 space-y-2">
                {landingNavItems.map((item) => {
                  const active = activeHash === item.hash;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-base font-medium transition-all duration-300",
                        active ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 grid gap-3">
                <Link href="/giris" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  Giriş Yap
                </Link>
                <Link href="/kayit" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  Ücretsiz Başla
                </Link>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
