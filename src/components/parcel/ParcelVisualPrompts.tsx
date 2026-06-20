"use client";

import toast from "react-hot-toast";
import { ClipboardCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ParcelVisualPrompt } from "@/types/parcel";

export function ParcelVisualPrompts({
  prompts
}: {
  prompts: ParcelVisualPrompt[] | null | undefined;
}) {
  const copyPrompt = async (prompt: ParcelVisualPrompt) => {
    const content = [
      `Baslik: ${prompt.title}`,
      `Kullanim yeri: ${prompt.usageArea}`,
      `Prompt: ${prompt.prompt}`,
      `Negatif prompt: ${prompt.negativePrompt}`,
      `Oran: ${prompt.aspectRatio}`
    ].join("\n");

    await navigator.clipboard.writeText(content);
    toast.success(`${prompt.title} kopyalandi.`);
  };

  return (
    <Card className="rounded-[2rem] border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Gorsel Uretim Promptlari</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Instagram, Sahibinden ve premium drone sunumlari icin hazir prompt seti.
        </p>
      </CardHeader>
      <CardContent>
        {prompts?.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {prompts.map((prompt) => (
              <div key={prompt.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{prompt.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{prompt.usageArea}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {prompt.aspectRatio}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prompt</p>
                    <Textarea readOnly value={prompt.prompt} className="min-h-[140px] resize-none bg-white" />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Negatif Prompt
                    </p>
                    <Textarea
                      readOnly
                      value={prompt.negativePrompt}
                      className="min-h-[110px] resize-none bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => void copyPrompt(prompt)}>
                    <ClipboardCopy className="h-4 w-4" />
                    Promptu Kopyala
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
            AI promptlari hazir oldugunda bu alanda 6 farkli gorsel senaryosu listelenecek.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
