import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  BlogPost,
  DashboardMetric,
  FAQItem,
  InvoiceRecord,
  PricingPlan,
  ServiceItem,
  ShootRecord,
  Testimonial
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = "tr-TR", currency = "TRY") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: string, locale = "tr-TR") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const services: ServiceItem[] = [
  {
    slug: "arsa-analizi",
    title: "Arsa ve Lokasyon Analizi",
    excerpt: "İmar, erişim ve pazarlama potansiyelini kısa raporda toplayın.",
    description:
      "Mapbox destekli konum katmanları ve özet raporlarla arsanın yatırım değerini daha hızlı anlatın.",
    highlights: ["Erişim analizi", "Yakın çevre özeti", "Pazarlama önerileri"],
    priceFrom: 399
  },
  {
    slug: "emlak-drone-cekimi",
    title: "Sanal Drone Çekimi",
    excerpt: "Dakikalar içinde satışa hazır dijital emlak videosu üretin.",
    description:
      "Ada ve parsel bilgisinden başlayan akışla profesyonel görünümlü sanal drone videoları oluşturun.",
    highlights: ["AI kamera rotası", "Kurumsal marka alanları", "Türkçe anlatım"],
    priceFrom: 399
  },
  {
    slug: "insaat-ilerleme-takibi",
    title: "İnşaat İlerleme Takibi",
    excerpt: "Şantiye ilerleyişini görsel ve rapor odaklı sunuma dönüştürün.",
    description:
      "Düzenli çekimlerle proje güncellemelerini yatırımcıya ve alıcıya anlaşılır biçimde aktarın.",
    highlights: ["Zaman çizelgesi", "Görsel kıyas", "Paylaşılabilir rapor"],
    priceFrom: 799
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Başlangıç",
    credits: 1,
    monthlyPrice: 399,
    description: "Tekil çekim yapan danışmanlar için.",
    features: ["1 çekim", "1080p video", "Logo ve telefon alanı"]
  },
  {
    name: "Profesyonel",
    credits: 5,
    monthlyPrice: 799,
    description: "Daha zengin sunum isteyen ekipler için.",
    highlighted: true,
    features: ["4K video", "AI seslendirme", "3D tur", "Arsa analizi"]
  },
  {
    name: "Kurumsal",
    credits: 15,
    monthlyPrice: 2499,
    description: "Toplu üretim yapan ofisler için.",
    features: ["API erişimi", "White-label teslim", "Toplu paket indirimi"]
  }
];

export const faqItems: FAQItem[] = [
  {
    question: "Çekim olmadan analiz alabilir miyim?",
    answer: "Evet. Arsa ve lokasyon analizi bağımsız çalışır."
  },
  {
    question: "AI seslendirme hangi dilde hazırlanıyor?",
    answer: "Varsayılan olarak Türkçe hazırlanır ve seslendirilebilir."
  },
  {
    question: "Krediler nasıl kullanılıyor?",
    answer: "Her üretim akışı seçilen hizmete göre 1 veya daha fazla kredi tüketir."
  },
  {
    question: "Kurumsal kullanımda özel destek var mı?",
    answer: "Evet. Kurumsal paket için özel destek ve entegrasyon akışı sunulur."
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Zeynep Arslan",
    role: "Lüks Konut Danışmanı",
    company: "Bosphorus Prime",
    quote: "Portföy sunum süremizi ciddi biçimde kısalttı."
  },
  {
    name: "Mert Kaan Yıldız",
    role: "Proje Satış Müdürü",
    company: "Nova İnşaat",
    quote: "Tek bağlantı üzerinden video ve analiz göndermek müşteri deneyimini iyileştirdi."
  },
  {
    name: "Ezgi Demir",
    role: "Arsa Yatırım Uzmanı",
    company: "Anadolu Land",
    quote: "Yakın çevre etiketleri ve rapor özeti teklif sunumunu netleştiriyor."
  }
];

export const blogPosts: BlogPost[] = [
  {
    slug: "drone-cekimleriyle-ilan-donusumu-artirma",
    title: "Drone Çekimleriyle İlan Dönüşümü Nasıl Artırılır?",
    excerpt: "Video ve hava görüntüsünün emlak ilanlarında etkisini özetliyoruz.",
    category: "Pazarlama",
    publishedAt: "2026-05-04",
    readingTime: "6 dk",
    author: "Drone360 Editör",
    content: [
      "Drone görüntüleri alan algısını daha hızlı kurar.",
      "Arsa ve villa portföylerinde çevre bağlantısı dönüşümü yükseltir.",
      "Kısa, odaklı ve aksiyon çağrısı içeren akışlar daha iyi performans gösterir."
    ]
  },
  {
    slug: "arsa-analizinde-bakilmasi-gereken-5-veri",
    title: "Arsa Analizinde Bakılması Gereken 5 Kritik Veri",
    excerpt: "Yatırım kararını etkileyen verileri sade biçimde sıraladık.",
    category: "Arsa Analizi",
    publishedAt: "2026-04-18",
    readingTime: "8 dk",
    author: "Selin Kara",
    content: [
      "İmar, erişim, topoğrafya ve çevre yapılaşma birlikte değerlendirilmelidir.",
      "Otomatik raporlar danışman ekiplerde operasyon yükünü azaltır.",
      "Sayısal içgörü ve görsel sunum birlikte ilerlediğinde güven artar."
    ]
  },
  {
    slug: "turkce-ai-seslendirme-ile-portfoy-hikayelestirme",
    title: "Türkçe AI Seslendirme ile Portföy Nasıl Hikayeleştirilir?",
    excerpt: "Yapay zeka seslendirme metinleriyle turu daha etkili hale getirin.",
    category: "Yapay Zeka",
    publishedAt: "2026-03-29",
    readingTime: "5 dk",
    author: "Onur Aksoy",
    content: [
      "İyi bir seslendirme yaşam senaryosunu ve yatırım sebebini birlikte anlatır.",
      "Türkçe tonlama ve kısa cümleler videonun profesyonel hissini güçlendirir.",
      "Hedef alıcı profili metin üretiminde belirleyicidir."
    ]
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Toplam Çekim", value: "12", delta: "Aktif portföyleriniz" },
  { label: "Bu Ay Çekim", value: "4", delta: "Aylık üretim" },
  { label: "Kalan Kredi", value: "1", delta: "Ücretsiz başlangıç kredisi" },
  { label: "Toplam İzlenme", value: "1.248", delta: "Paylaşım linklerinden" }
];

export const sampleShoots: ShootRecord[] = [
  {
    id: "shoot-istanbul-villa",
    title: "Ada 142 / Parsel 8",
    status: "READY",
    type: "DRONE",
    location: "Sarıyer, İstanbul",
    city: "İstanbul",
    district: "Sarıyer",
    createdAt: "2026-06-10",
    creditsUsed: 1,
    viewCount: 420,
    previewVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    analysisSummary: "Boğaz bağlantı aksına yakın, görünürlük açısından güçlü bir konum.",
    coordinates: [29.039, 41.163],
    adaNo: "142",
    parselNo: "8"
  },
  {
    id: "shoot-bodrum-arsa",
    title: "Ada 75 / Parsel 19",
    status: "PROCESSING",
    type: "COMBO",
    location: "Bodrum, Muğla",
    city: "Muğla",
    district: "Bodrum",
    createdAt: "2026-06-12",
    creditsUsed: 2,
    viewCount: 318,
    previewVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    analysisSummary: "Turizm odaklı yatırım sunumu için güçlü bir çevre bağlamı sunuyor.",
    coordinates: [27.4305, 37.0344],
    adaNo: "75",
    parselNo: "19"
  },
  {
    id: "shoot-ankara-ofis",
    title: "Ada 12 / Parsel 3",
    status: "FAILED",
    type: "TOUR_3D",
    location: "Çankaya, Ankara",
    city: "Ankara",
    district: "Çankaya",
    createdAt: "2026-06-09",
    creditsUsed: 1,
    viewCount: 84,
    analysisSummary: "Konum doğrulama tamamlandı ancak medya üretimi yeniden başlatılmalı.",
    coordinates: [32.847, 39.92],
    adaNo: "12",
    parselNo: "3"
  }
];

export const sampleInvoices: InvoiceRecord[] = [
  {
    id: "inv-2026-001",
    paymentId: "pay-001",
    total: 799,
    status: "Ödendi",
    issuedAt: "2026-06-03",
    downloadUrl: "#"
  },
  {
    id: "inv-2026-002",
    paymentId: "pay-002",
    total: 399,
    status: "Bekliyor",
    issuedAt: "2026-06-11",
    downloadUrl: "#"
  }
];

export const statusLabels: Record<string, string> = {
  PROCESSING: "Hazırlanıyor",
  READY: "Hazır",
  FAILED: "Hata"
};

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getShootById(id: string) {
  return sampleShoots.find((shoot) => shoot.id === id);
}
