import OpenAI from "openai";

export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

export function getOpenAIModel() {
  return OPENAI_MODEL;
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

type VoiceoverInput = {
  il: string;
  ilce: string;
  adaNo: string;
  parselNo: string;
  nearbyLabels: string[];
  notes?: string;
};

export async function generateVoiceoverText({
  il,
  ilce,
  adaNo,
  parselNo,
  nearbyLabels,
  notes
}: VoiceoverInput) {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "developer",
        content:
          "Sen deneyimli bir Türk emlak danışmanısın. Verilen arsa/konut konumu için 45-60 saniyelik, ikna edici, profesyonel bir video seslendirme metni yaz. Yakın çevre avantajlarını vurgula. Sadece metni yaz, başka hiçbir şey ekleme."
      },
      {
        role: "user",
        content: `İl: ${il}
İlçe: ${ilce}
Ada No: ${adaNo}
Parsel No: ${parselNo}
Yakın Çevre Avantajları: ${nearbyLabels.length ? nearbyLabels.join(", ") : "Belirtilmedi"}
Ek Notlar: ${notes?.trim() || "Yok"}

45-60 saniyelik Türkçe profesyonel seslendirme metni hazırla.`
      }
    ]
  });

  return response.output_text.trim();
}
