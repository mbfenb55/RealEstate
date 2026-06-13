import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const footerColumns = [
  {
    title: "Ürün",
    links: [
      { href: "/#hizmetler", label: "Hizmetler" },
      { href: "/#ozellikler", label: "Özellikler" },
      { href: "/#fiyatlar", label: "Fiyatlar" }
    ]
  },
  {
    title: "Şirket",
    links: [
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/blog", label: "Blog" },
      { href: "/iletisim", label: "İletişim" }
    ]
  },
  {
    title: "Kaynaklar",
    links: [
      { href: "/giris", label: "Giriş Yap" },
      { href: "/kayit", label: "Ücretsiz Başla" },
      { href: "/#sss", label: "Sık Sorulan Sorular" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="bg-dark-bg text-slate-300">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white">
                D
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Drone360 Türkiye</p>
                <p className="text-sm text-slate-400">AI destekli emlak medya platformu</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Ada-parsel odaklı sanal drone çekimi, 3D tur, arsa analizi ve Türkçe seslendirme altyapısını tek SaaS ürününde birleştirir.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Linkedin, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{column.title}</p>
              <div className="mt-5 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400">
          © 2026 Drone360 Türkiye. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
