import { formatDate } from "@/lib/utils";
import type { AuthProfile, ShootRecord } from "@/types";

export function getStatusBadgeVariant(status: ShootRecord["status"]) {
  if (status === "READY") return "success";
  if (status === "FAILED") return "destructive";
  return "warning";
}

export function getStatusLabel(status: ShootRecord["status"]) {
  if (status === "READY") return "Hazır";
  if (status === "FAILED") return "Hata";
  return "Hazırlanıyor";
}

export function getShootTypeLabel(type: ShootRecord["type"]) {
  if (type === "TOUR_3D") return "3D Sanal Tur";
  if (type === "COMBO") return "Kombine";
  return "Sanal Drone";
}

export function getDashboardMetrics(shoots: ShootRecord[], profile?: AuthProfile | null) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthShoots = shoots.filter((shoot) => {
    const date = new Date(shoot.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const totalViews = shoots.reduce((sum, shoot) => sum + shoot.viewCount, 0);

  return [
    {
      label: "Toplam Çekim",
      value: String(shoots.length),
      delta: shoots.length ? `Son çekim: ${formatDate(shoots[0].createdAt)}` : "Henüz çekim yok"
    },
    {
      label: "Bu Ay Çekim",
      value: String(thisMonthShoots),
      delta: "Aylık üretim sayınız"
    },
    {
      label: "Kalan Kredi",
      value: String(profile?.credits ?? 0),
      delta: "Hesap bakiyeniz"
    },
    {
      label: "Toplam İzlenme",
      value: totalViews.toLocaleString("tr-TR"),
      delta: "Paylaşım bağlantılarından gelen görüntülenme"
    }
  ];
}
