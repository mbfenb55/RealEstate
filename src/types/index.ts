export type ServiceItem = {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  highlights: string[];
  priceFrom: number;
};

export type PricingPlan = {
  name: string;
  credits: number;
  monthlyPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  author: string;
  content: string[];
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
};

export type AuthProfile = {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  credits: number;
  createdAt: string;
};

export type ShootStatus = "PROCESSING" | "READY" | "FAILED";
export type ShootType = "DRONE" | "TOUR_3D" | "COMBO";

export type NearbyPlace = {
  id: string;
  name: string;
  distanceMeters: number;
  category: "Ulaşım" | "Eğitim" | "Sağlık" | "Alışveriş" | "Parklar" | "Restoranlar";
  typeLabel: string;
};

export type ShootLandAnalysis = {
  summary?: string;
  areaSqm?: number;
  zoningStatus?: string;
  estimatedValueRange?: {
    min: number;
    max: number;
    currency?: string;
  };
  reportPdfUrl?: string;
  nearbyPois?: NearbyPlace[];
};

export type ShootRecord = {
  id: string;
  title: string;
  status: ShootStatus;
  type: ShootType;
  location: string;
  city: string;
  district?: string;
  createdAt: string;
  creditsUsed: number;
  viewCount: number;
  previewVideoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  analysisSummary?: string;
  voiceoverText?: string;
  coordinates?: [number, number];
  adaNo?: string;
  parselNo?: string;
  nearbyLabels?: NearbyPlace[];
  landAnalysis?: ShootLandAnalysis;
  publicToken?: string;
  logoUrl?: string;
  phoneNumber?: string;
  brandColor?: string;
};

export type InvoiceRecord = {
  id: string;
  paymentId?: string;
  total: number;
  status: "Ödendi" | "Bekliyor";
  issuedAt: string;
  downloadUrl?: string;
};

export type NearbyLabelSelection = {
  id: string;
  name: string;
  distanceMeters: number;
  category: NearbyPlace["category"];
  typeLabel: string;
  custom?: boolean;
};

export type WizardFormData = {
  adaNo: string;
  parselNo: string;
  il: string;
  ilce: string;
  coordinates?: [number, number];
  neighborhoodSummary?: string;
  validatedLocation?: boolean;
  shootType: ShootType;
  estimatedCredits: number;
  logoUrl?: string;
  logoName?: string;
  phoneNumber: string;
  brandColor: string;
  voiceoverText: string;
  nearbyLabels: NearbyLabelSelection[];
  customLabels: string[];
  cardNumber: string;
  expiry: string;
  cvv: string;
  needsPayment: boolean;
  orderAmount: number;
};
