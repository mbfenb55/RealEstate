import type { ShootType } from "@/types";

export type ShootOption = {
  type: ShootType;
  title: string;
  description: string;
  credits: number;
  amount: number;
  badge?: string;
  features: string[];
};

export const SHOOT_OPTIONS: ShootOption[] = [
  {
    type: "DRONE",
    title: "Sanal Drone Çekimi",
    description: "Yapay zeka ile oluşturulan sinematik rota ve profesyonel ilan videosu.",
    credits: 1,
    amount: 399,
    features: ["1080p video", "Logo ve telefon ekleme", "WhatsApp paylaşım çıktısı"]
  },
  {
    type: "TOUR_3D",
    title: "3D Sanal Tur",
    description: "Harita üstünde etiketlenmiş, alıcıyı bölgeye hızlıca taşıyan etkileşimli sunum.",
    credits: 1,
    amount: 499,
    features: ["3D harita görünümü", "Yakın çevre etiketleri", "Mobil uyumlu paylaşım"]
  },
  {
    type: "COMBO",
    title: "Kombine Paket",
    description: "Drone video, 3D tur ve çevre analizi birlikte. En yüksek dönüşüm için tek teslimat.",
    credits: 1.5,
    amount: 799,
    badge: "TASARRUF",
    features: ["4K teslimat", "AI Türkçe seslendirme", "Arsa analizi özeti"]
  }
];

export function getShootOption(type: ShootType) {
  return SHOOT_OPTIONS.find((item) => item.type === type) ?? SHOOT_OPTIONS[0];
}

export function getRequiredCreditUnits(type: ShootType) {
  return Math.ceil(getShootOption(type).credits);
}

export function formatCreditAmount(amount: number) {
  return Number.isInteger(amount)
    ? amount.toLocaleString("tr-TR")
    : amount.toLocaleString("tr-TR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
}
