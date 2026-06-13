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
    "Parselim | AI Destekli Sanal Drone Çekimi ve Arsa Analizi",
    "Ada-parsel verileriyle profesyonel sanal drone çekimi, 3D tur ve arsa analizi oluşturun."
  ),
  title: {
    default: "Parselim | AI Destekli Sanal Drone Çekimi ve Arsa Analizi",
    template: "%s | Parselim"
  },
  keywords: ["arsa analizi", "sanal drone çekimi", "3D sanal tur", "emlak SaaS", "Türkiye emlak yazılımı"]
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
