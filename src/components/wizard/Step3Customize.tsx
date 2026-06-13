"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HexColorPicker } from "react-colorful";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Bot, Headphones, ImagePlus, Palette, Phone, UploadCloud } from "lucide-react";

import { hasPublicSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { getShootOption } from "@/lib/shoot-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWizardStore } from "@/store/wizardStore";

const schema = z.object({
  logoUrl: z.string().optional(),
  logoName: z.string().optional(),
  phoneNumber: z.string().optional(),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Geçerli bir marka rengi seçin."),
  voiceoverText: z.string().max(500, "Seslendirme metni en fazla 500 karakter olabilir.")
});

type FormValues = z.infer<typeof schema>;

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "").slice(0, 10);

  if (!digits) {
    return "";
  }

  let formatted = "+90";

  if (digits.length > 0) {
    formatted += ` ${digits.slice(0, 3)}`;
  }
  if (digits.length > 3) {
    formatted += ` ${digits.slice(3, 6)}`;
  }
  if (digits.length > 6) {
    formatted += ` ${digits.slice(6, 8)}`;
  }
  if (digits.length > 8) {
    formatted += ` ${digits.slice(8, 10)}`;
  }

  return formatted;
}

export function Step3Customize({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, patchData } = useWizardStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "branding-assets";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      logoUrl: data.logoUrl,
      logoName: data.logoName,
      phoneNumber: data.phoneNumber,
      brandColor: data.brandColor,
      voiceoverText: data.voiceoverText
    }
  });

  const voiceoverText = form.watch("voiceoverText") ?? "";
  const brandColor = form.watch("brandColor");
  const currentOption = useMemo(() => getShootOption(data.shootType), [data.shootType]);

  const uploadLogo = useCallback(
    async (file: File) => {
      setUploadError(null);
      setUploading(true);

      const temporaryPreview = URL.createObjectURL(file);
      setLogoPreview(temporaryPreview);

      try {
        if (!hasPublicSupabaseEnv()) {
          throw new Error("Supabase Storage yapılandırması eksik.");
        }

        const supabase = createClient();
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
        const filePath = `logos/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

        if (error) {
          throw error;
        }

        const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        form.setValue("logoUrl", publicUrl.publicUrl, { shouldDirty: true });
        form.setValue("logoName", file.name, { shouldDirty: true });
        setLogoPreview(publicUrl.publicUrl);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Logo yüklenemedi. Supabase Storage ayarlarını kontrol edin."
        );
      } finally {
        setUploading(false);
      }
    },
    [bucketName, form]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      await uploadLogo(file);
    },
    [uploadLogo]
  );

  const dropzone = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 2 * 1024 * 1024,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"]
    }
  });

  const handleGenerateVoiceover = async () => {
    setAiLoading(true);
    setActionError(null);

    try {
      const response = await fetch("/api/ai/seslendirme-metni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          il: data.il,
          ilce: data.ilce,
          adaNo: data.adaNo,
          parselNo: data.parselNo,
          nearbyLabels: data.nearbyLabels.length
            ? data.nearbyLabels.slice(0, 6).map((item) => item.name)
            : [currentOption.title, "Kurumsal görünüm", "Hızlı teslimat"]
        })
      });

      const payload = (await response.json()) as { text?: string; error?: string };

      if (!response.ok || !payload.text) {
        throw new Error(payload.error ?? "AI metni üretilemedi.");
      }

      form.setValue("voiceoverText", payload.text.slice(0, 500), {
        shouldDirty: true,
        shouldValidate: true
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "AI metni üretilemedi.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAudioPreview = async () => {
    setAudioLoading(true);
    setActionError(null);

    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: voiceoverText
        })
      });

      if (!response.ok) {
        throw new Error("Ses önizlemesi hazırlanamadı.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      void new Audio(url).play().catch(() => undefined);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Ses önizlemesi hazırlanamadı.");
    } finally {
      setAudioLoading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    patchData({
      logoUrl: values.logoUrl || "",
      logoName: values.logoName || "",
      phoneNumber: values.phoneNumber || "",
      brandColor: values.brandColor,
      voiceoverText: values.voiceoverText
    });
    onNext();
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-slate-900">Logo Yükleme</h3>
              </div>

              <div
                {...dropzone.getRootProps()}
                className="cursor-pointer rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-all duration-300 hover:border-primary/40"
              >
                <input {...dropzone.getInputProps()} />
                <UploadCloud className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-sm font-medium text-slate-900">PNG, JPG veya SVG dosyanızı bırakın</p>
                <p className="mt-1 text-sm text-slate-500">Maksimum 2 MB. Marka logosu videoya otomatik eklenir.</p>
              </div>

              {uploading ? <p className="text-sm text-slate-500">Logo yükleniyor...</p> : null}
              {uploadError ? <p className="text-sm text-rose-500">{uploadError}</p> : null}
              {dropzone.fileRejections[0]?.errors[0]?.message ? (
                <p className="text-sm text-rose-500">{dropzone.fileRejections[0].errors[0].message}</p>
              ) : null}

              {logoPreview ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-slate-900">{form.getValues("logoName") || "Yüklenen logo"}</p>
                  <Image
                    src={logoPreview}
                    alt="Yüklenen logo önizleme"
                    width={200}
                    height={80}
                    unoptimized
                    className="h-20 w-auto object-contain"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-slate-900">İletişim ve Marka</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefon Numarası</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+90 5xx xxx xx xx"
                  value={form.watch("phoneNumber") ?? ""}
                  onChange={(event) =>
                    form.setValue("phoneNumber", formatPhoneNumber(event.target.value), {
                      shouldDirty: true
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label>Marka Rengi</Label>
                </div>
                <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                  <HexColorPicker color={brandColor} onChange={(value) => form.setValue("brandColor", value)} />
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Seçilen renk</span>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: brandColor }}>
                        {brandColor}
                      </span>
                    </div>
                    <div className="mt-4 h-16 rounded-2xl" style={{ backgroundColor: brandColor }} />
                  </div>
                </div>
                <p className="text-sm text-rose-500">{form.formState.errors.brandColor?.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2rem] border-slate-200">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-slate-900">AI Türkçe Seslendirme</h3>
              </div>
              <span className="text-sm text-slate-500">{voiceoverText.length}/500</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voiceoverText">Seslendirme Metni</Label>
              <Textarea
                id="voiceoverText"
                maxLength={500}
                placeholder="Arsanın öne çıkan yönlerini veya AI tarafından oluşturulan metni burada düzenleyin."
                {...form.register("voiceoverText")}
              />
              <p className="text-sm text-rose-500">{form.formState.errors.voiceoverText?.message}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                loading={aiLoading}
                loadingText="Metin hazırlanıyor"
                onClick={handleGenerateVoiceover}
              >
                <Bot className="h-4 w-4" />
                AI ile Otomatik Oluştur
              </Button>
              <Button
                type="button"
                variant="outline"
                loading={audioLoading}
                loadingText="Ses oluşturuluyor"
                disabled={voiceoverText.trim().length < 10}
                onClick={handleAudioPreview}
              >
                <Headphones className="h-4 w-4" />
                Sesi Dinle
              </Button>
            </div>

            {audioUrl ? <audio controls src={audioUrl} className="w-full" /> : null}
            {actionError ? <p className="text-sm text-rose-500">{actionError}</p> : null}

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{currentOption.title} için öneri</p>
              <p className="mt-2">
                AI metni mevcut konum, seçilen çekim türü ve yakın çevre etiketlerine göre hazırlanır. Metni isterseniz
                düzenleyerek bir sonraki adıma geçebilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" type="button" onClick={onBack}>
          Geri
        </Button>
        <Button type="submit">Devam Et</Button>
      </div>
    </form>
  );
}
