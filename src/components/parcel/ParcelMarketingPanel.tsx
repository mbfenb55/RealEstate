"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ParcelAnalysisRecord, ParcelSocialCaptions } from "@/types/parcel";

const tabs = [
  { id: "instagram", label: "Instagram" },
  { id: "sahibinden", label: "Sahibinden" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "reels", label: "Reels" }
] as const;

type TabId = keyof ParcelSocialCaptions;

export function ParcelMarketingPanel({ analysis }: { analysis: ParcelAnalysisRecord }) {
  const [activeTab, setActiveTab] = useState<TabId>("instagram");

  const caption = useMemo(() => {
    return analysis.socialCaptions?.[activeTab] ?? "";
  }, [activeTab, analysis.socialCaptions]);

  const copyCaption = async () => {
    if (!caption) {
      return;
    }

    await navigator.clipboard.writeText(caption);
    toast.success(`${tabs.find((item) => item.id === activeTab)?.label} metni kopyalandi.`);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Yatirim ve Pazarlama Analizi</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Hedef musteri, avantajlar ve dikkat edilmesi gereken basliklar burada toplanir.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            {analysis.marketingSummary ??
              "AI analiz henuz tamamlanmadi. Yuklemeden sonra bu alan otomatik guncellenecek."}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-900">Yatirim Avantajlari</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {(analysis.investmentAnalysis?.investmentAdvantages ?? []).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
                {!analysis.investmentAnalysis?.investmentAdvantages.length ? (
                  <li>AI avantaj maddeleri burada gosterilecek.</li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-900">Dikkat Edilmesi Gerekenler</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {(analysis.investmentAnalysis?.cautions ?? []).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
                {!analysis.investmentAnalysis?.cautions.length ? (
                  <li>Kontrol maddeleri AI analizinden sonra listelenir.</li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900">Hedef Musteri Profili</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {analysis.investmentAnalysis?.targetBuyerProfile ??
                "Hedef musteri profili AI analizinden sonra otomatik olusturulacak."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Pazarlama Metinleri</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Sosyal medya, ilan ve mesajlasma kanallari icin hazir kopyalar.
            </p>
          </div>

          <div className="inline-flex flex-wrap rounded-full border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            readOnly
            value={caption || "AI metni hazirlandiginda burada gorunecek."}
            className="min-h-[260px] resize-none"
          />

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => void copyCaption()} disabled={!caption}>
              <ClipboardCopy className="h-4 w-4" />
              Metni Kopyala
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
