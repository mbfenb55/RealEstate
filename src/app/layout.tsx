import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { buildPageMetadata } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  ...buildPageMetadata(
    "Drone360 Türkiye | Yapay Zeka Destekli Emlak Drone Turları",
    "Türkiye emlak pazarı için yapay zeka destekli sanal drone turu, arsa analizi, seslendirme ve satış hızlandırma platformu."
  ),
  title: {
    default: "Drone360 Türkiye | Yapay Zeka Destekli Emlak Drone Turları",
    template: "%s | Drone360 Türkiye"
  },
  keywords: ["drone çekimi", "arsa analizi", "emlak SaaS", "Türkiye emlak yazılımı", "sanal drone turu"]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
