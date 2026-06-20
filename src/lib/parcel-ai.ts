import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import {
  parcelAiResultSchema,
  parcelInvestmentAnalysisSchema,
  parcelSocialCaptionsSchema,
  parcelVisualPromptSchema,
  type ParcelAiResult,
  type ParcelAnalysisRecord,
  type ParcelVisualPrompt
} from "@/types/parcel";

const VISUAL_PROMPT_BLUEPRINTS = [
  {
    title: "Instagram Post 1080x1350",
    usageArea: "Instagram feed",
    aspectRatio: "4:5"
  },
  {
    title: "Instagram Story 1080x1920",
    usageArea: "Instagram story",
    aspectRatio: "9:16"
  },
  {
    title: "Reels Kapak",
    usageArea: "Instagram Reels kapagi",
    aspectRatio: "9:16"
  },
  {
    title: "Sahibinden Kapak Gorseli",
    usageArea: "Sahibinden listeleme kapagi",
    aspectRatio: "16:9"
  },
  {
    title: "Drone Tarzi Premium Gorsel",
    usageArea: "Premium ilan ve vitrin kullanimi",
    aspectRatio: "16:9"
  },
  {
    title: "Google Earth Tarzi Harita Gorseli",
    usageArea: "Harita ustu parsel sunumu",
    aspectRatio: "4:5"
  }
] as const;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildParcelLabel(parcel: ParcelAnalysisRecord) {
  return [parcel.adaNo ? `Ada ${parcel.adaNo}` : null, parcel.parselNo ? `Parsel ${parcel.parselNo}` : null]
    .filter(Boolean)
    .join(" / ");
}

function buildFallbackScore(parcel: ParcelAnalysisRecord) {
  const areaBoost = Math.min(18, parcel.areaM2 / 220);
  const frontageBoost = Math.min(10, parcel.approximateFrontageM / 4);
  const geometryBoost = parcel.cornerPoints.length <= 6 ? 8 : 5;
  return clampScore(58 + areaBoost + frontageBoost + geometryBoost);
}

function buildFallbackVisualPrompts(parcel: ParcelAnalysisRecord): ParcelVisualPrompt[] {
  const locationLabel = [parcel.ilce, parcel.il].filter(Boolean).join(", ") || "Turkey";
  const parcelLabel = buildParcelLabel(parcel) || "onecikan arsa";

  return VISUAL_PROMPT_BLUEPRINTS.map((item) =>
    parcelVisualPromptSchema.parse({
      title: item.title,
      usageArea: item.usageArea,
      aspectRatio: item.aspectRatio,
      prompt: `Premium real estate marketing visual, ${locationLabel} icin ${parcelLabel}, red highlighted parcel boundary, satellite map background, polished Turkish listing layout, elegant typography, area and coordinate emphasis, high-end property investment mood, clean information hierarchy, ${item.aspectRatio} composition`,
      negativePrompt:
        "low resolution, blurry text, extra parcel boundaries, distorted map labels, cluttered layout, unrealistic colors, watermark, duplicate markers"
    })
  );
}

function buildReportHtml(parcel: ParcelAnalysisRecord, result: Omit<ParcelAiResult, "reportHtml">) {
  const location = [parcel.ilce, parcel.il].filter(Boolean).join(", ") || "Belirtilen konum";
  const parcelLabel = buildParcelLabel(parcel) || "Parsel";

  return `
    <section>
      <h2>${parcelLabel} Pazarlama Ozeti</h2>
      <p>${result.marketingSummary}</p>
      <p><strong>Konum:</strong> ${location}</p>
      <p><strong>Alan:</strong> ${parcel.areaM2.toLocaleString("tr-TR")} m²</p>
      <p><strong>Yatirim Puani:</strong> ${result.investmentScore}/100</p>
      <h3>Avantajlar</h3>
      <ul>${result.investmentAnalysis.investmentAdvantages.map((item) => `<li>${item}</li>`).join("")}</ul>
      <h3>Dikkat Edilmesi Gerekenler</h3>
      <ul>${result.investmentAnalysis.cautions.map((item) => `<li>${item}</li>`).join("")}</ul>
      <h3>Hedef Musteri Profili</h3>
      <p>${result.investmentAnalysis.targetBuyerProfile}</p>
    </section>
  `.trim();
}

function buildFallbackResult(parcel: ParcelAnalysisRecord): ParcelAiResult {
  const location = [parcel.ilce, parcel.il].filter(Boolean).join(", ") || "belirtilen bolge";
  const parcelLabel = buildParcelLabel(parcel) || "Bu parsel";
  const investmentScore = buildFallbackScore(parcel);
  const baseResult = {
    marketingSummary: `${parcelLabel}, ${location} icinde ${parcel.areaM2.toLocaleString("tr-TR")} m² buyuklugu ve ${parcel.approximateFrontageM.toLocaleString("tr-TR")} metreye yaklasan cephe etkisiyle pazarlama anlatisi kurmaya uygun bir yatirim profili sunuyor.`,
    investmentScore,
    investmentAnalysis: parcelInvestmentAnalysisSchema.parse({
      investmentAdvantages: [
        `Parselin ${parcel.areaM2.toLocaleString("tr-TR")} m² buyuklugundeki olcegi fark edilir bir sunum avantajı saglar.`,
        `${parcel.cornerPoints.length} kose noktasi sayesinde koordinat anlatimi net sekilde paylasilabilir.`,
        `${parcel.approximateFrontageM.toLocaleString("tr-TR")} metre civarindaki yaklasik cephe, gorsel sunumda guclu bir ilk izlenim verir.`
      ],
      cautions: [
        "Tapu, imar ve yol cephe teyidinin resmi belgelerle desteklenmesi gerekir.",
        "Pazarlama metninde altyapi ve ulasim detaylari varsa sahadan dogrulanmalidir.",
        "Alan buyuklugu guclu olsa da kullanim senaryosu hedef aliciya gore netlestirilmelidir."
      ],
      targetBuyerProfile:
        "Uzun vadeli arsa yatirimi, butik proje gelistirme veya portfoyune deger odakli yeni bir varlik eklemek isteyen alicilar."
    }),
    socialCaptions: parcelSocialCaptionsSchema.parse({
      instagram: `${location} bolgesinde dikkat ceken bir parsel firsati. ${parcel.areaM2.toLocaleString("tr-TR")} m² alan, net sinir yapisi ve tanitimda guclu anlatim potansiyeliyle detayli bilgiye hazir.`,
      sahibinden: `${location} lokasyonunda yer alan bu parsel, ${parcel.areaM2.toLocaleString("tr-TR")} m² alan buyuklugu, belirgin sinirlari ve yatirima uygun profiliyle one cikiyor. Detayli koordinat tablosu ve pazarlama dosyasi hazirdir.`,
      whatsapp: `${location} icinde yer alan ${parcel.areaM2.toLocaleString("tr-TR")} m² parsel icin detayli analiz hazir. Konum, koordinat ve pazarlama metinlerini paylasabilirim.`,
      reels:
        "Burasi yatirim degeri yuksek, genis yuzolcumune sahip ozel bir parsel. Konumu, yol baglantisi ve kullanim potansiyeliyle dikkat cekiyor. Detayli bilgi icin bizimle iletisime gecin."
    }),
    visualPrompts: buildFallbackVisualPrompts(parcel)
  } as const;

  return parcelAiResultSchema.parse({
    ...baseResult,
    reportHtml: buildReportHtml(parcel, baseResult)
  });
}

function extractJsonObject(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI yaniti gecerli JSON icermiyor.");
  }

  return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
}

function normalizeAiResult(raw: Record<string, unknown>, fallback: ParcelAiResult, parcel: ParcelAnalysisRecord) {
  const investmentAnalysis = parcelInvestmentAnalysisSchema.parse(raw.investmentAnalysis ?? fallback.investmentAnalysis);
  const socialCaptions = parcelSocialCaptionsSchema.parse(raw.socialCaptions ?? fallback.socialCaptions);
  const visualPrompts = Array.isArray(raw.visualPrompts)
    ? raw.visualPrompts
        .map((item) => parcelVisualPromptSchema.safeParse(item).data)
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : fallback.visualPrompts;
  const baseResult = {
    marketingSummary:
      typeof raw.marketingSummary === "string" && raw.marketingSummary.trim()
        ? raw.marketingSummary.trim()
        : fallback.marketingSummary,
    investmentScore: clampScore(
      typeof raw.investmentScore === "number" ? raw.investmentScore : fallback.investmentScore
    ),
    investmentAnalysis,
    socialCaptions,
    visualPrompts: visualPrompts.length === 6 ? visualPrompts : fallback.visualPrompts
  };

  return parcelAiResultSchema.parse({
    ...baseResult,
    reportHtml:
      typeof raw.reportHtml === "string" && raw.reportHtml.trim()
        ? raw.reportHtml.trim()
        : buildReportHtml(parcel, baseResult)
  });
}

export async function generateParcelAiContent(parcel: ParcelAnalysisRecord) {
  const fallback = buildFallbackResult(parcel);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "developer",
          content:
            "Sen deneyimli bir Turk emlak pazarlama stratejistisin. Yaniti sadece gecerli JSON olarak ver. Alan adlari: marketingSummary, investmentScore, investmentAnalysis, socialCaptions, visualPrompts, reportHtml. visualPrompts dizisi tam 6 oge icermeli ve her oge title, usageArea, prompt, negativePrompt, aspectRatio alanlarina sahip olmali. Metinler Turkce olmali."
        },
        {
          role: "user",
          content: JSON.stringify({
            parcelLabel: buildParcelLabel(parcel),
            location: [parcel.ilce, parcel.il].filter(Boolean).join(", "),
            areaM2: parcel.areaM2,
            perimeterM: parcel.perimeterM,
            approximateFrontageM: parcel.approximateFrontageM,
            cornerCount: parcel.cornerPoints.length,
            centroid: {
              lat: parcel.centroidLat,
              lng: parcel.centroidLng
            },
            coordinateTable: parcel.cornerPoints,
            requiredPromptBlueprints: VISUAL_PROMPT_BLUEPRINTS
          })
        }
      ]
    });

    const rawResult = extractJsonObject(response.output_text);
    return normalizeAiResult(rawResult, fallback, parcel);
  } catch (error) {
    console.error("Parcel AI generation failed:", error);
    return fallback;
  }
}
