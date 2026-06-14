"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

import { isAdmin } from "@/lib/admin";
import { PAYMENTS_ENABLED } from "@/lib/features";
import { useAuth } from "@/hooks/useAuth";
import { formatCreditAmount, getRequiredCreditUnits, getShootOption } from "@/lib/shoot-options";
import { formatCurrency } from "@/lib/utils";
import { ProcessingOverlay } from "@/components/dashboard/ProcessingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/store/wizardStore";

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Kart numarasını eksiksiz girin."),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Son kullanma tarihi AA/YY formatında olmalıdır."),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV 3 veya 4 haneli olmalıdır.")
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function Step5Payment({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { data, patchData, reset } = useWizardStore();
  const { profile, user, refreshProfile } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const selectedOption = useMemo(() => getShootOption(data.shootType), [data.shootType]);
  const requiredCreditUnits = useMemo(() => getRequiredCreditUnits(data.shootType), [data.shootType]);
  const adminUser = isAdmin(profile?.email ?? user?.email ?? "");
  const canUseCredits = !adminUser && (profile?.credits ?? 0) >= requiredCreditUnits;
  const paymentsAvailable = PAYMENTS_ENABLED;
  const paymentRequired = !adminUser && !canUseCredits && paymentsAvailable;
  const allowDemoWithoutCredits = !adminUser && !canUseCredits && !paymentsAvailable;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvv: ""
    }
  });

  useEffect(() => {
    patchData({
      orderAmount: selectedOption.amount,
      estimatedCredits: selectedOption.credits,
      needsPayment: paymentRequired
    });
  }, [patchData, paymentRequired, selectedOption.amount, selectedOption.credits]);

  const createShootPayload = () => ({
    type: data.shootType,
    adaNo: data.adaNo,
    parselNo: data.parselNo,
    il: data.il,
    ilce: data.ilce,
    coordinates: data.coordinates,
    voiceoverText: data.voiceoverText,
    logoUrl: data.logoUrl,
    phoneNumber: data.phoneNumber,
    brandColor: data.brandColor,
    nearbyLabels: data.nearbyLabels,
    landAnalysis: {
      summary: data.neighborhoodSummary,
      labels: data.nearbyLabels
    },
    useCredits: !adminUser && canUseCredits,
    requiredCredits: selectedOption.credits
  });

  const startShoot = async () => {
    if (!profile) {
      throw new Error("Oturum bilgisi yüklenemedi. Lütfen sayfayı yenileyin.");
    }

    let createdShootId: string | null = null;

    try {
      const shootResponse = await fetch("/api/cekim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(createShootPayload())
      });

      const shootPayload = (await shootResponse.json()) as {
        item?: { id: string };
        error?: string;
      };

      if (!shootResponse.ok || !shootPayload.item?.id) {
        throw new Error(shootPayload.error ?? "Çekim kaydı oluşturulamadı.");
      }

      createdShootId = shootPayload.item.id;

      if (adminUser || canUseCredits || !paymentsAvailable) {
        await refreshProfile();
        setShowProcessing(true);
        reset();
        window.setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 3000);
        return;
      }

      const paymentResponse = await fetch("/api/odeme/baslat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          planName: selectedOption.title,
          amount: selectedOption.amount,
          shootId: createdShootId
        })
      });

      const paymentPayload = (await paymentResponse.json()) as {
        paymentPageUrl?: string;
        error?: string;
      };

      if (!paymentResponse.ok || !paymentPayload.paymentPageUrl) {
        throw new Error(paymentPayload.error ?? "Ödeme sayfası başlatılamadı.");
      }

      window.location.assign(paymentPayload.paymentPageUrl);
    } catch (error) {
      if (createdShootId && paymentsAvailable && !canUseCredits && !adminUser) {
        await fetch(`/api/cekim/${createdShootId}`, {
          method: "DELETE"
        }).catch(() => undefined);
      }

      throw error;
    }
  };

  const handleCreditSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);

    try {
      await startShoot();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Çekim başlatılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);

    try {
      await startShoot();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ödeme başlatılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProcessingOverlay open={showProcessing} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.85fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Sipariş ve Teslimat Onayı</h3>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {adminUser
                    ? "Admin modu aktif"
                    : canUseCredits
                      ? `${requiredCreditUnits} kredi kullanılacak`
                      : "Kredi yetersiz, güvenli ödeme gerekli"}
                </p>
                <p className="mt-2">
                  Seçilen hizmet {formatCreditAmount(selectedOption.credits)} kredi değerindedir.
                  {selectedOption.type === "COMBO"
                    ? ` Kombine çekimler kredi bakiyesinde ${requiredCreditUnits} tam kredi olarak işlenir.`
                    : null}
                </p>
              </div>

              {adminUser ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                  <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Admin modu - ödeme atlandı
                  </div>
                  <p>
                    Yönetici hesabı için kredi kontrolü uygulanmaz. Çekimi doğrudan başlatabilirsiniz.
                  </p>
                </div>
              ) : canUseCredits ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                  Hesabınızdaki kredi bu çekim için yeterli. Onay verdiğiniz anda çekim kaydı oluşturulup işleme alınacaktır.
                </div>
              ) : paymentsAvailable ? (
                <form className="space-y-5" onSubmit={form.handleSubmit(handlePaymentSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Kart Numarası</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={form.watch("cardNumber")}
                      onChange={(event) =>
                        form.setValue("cardNumber", formatCardNumber(event.target.value), {
                          shouldDirty: true,
                          shouldValidate: true
                        })
                      }
                    />
                    <p className="text-sm text-rose-500">{form.formState.errors.cardNumber?.message}</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Son Kullanma</Label>
                      <Input
                        id="expiry"
                        placeholder="AA/YY"
                        value={form.watch("expiry")}
                        onChange={(event) =>
                          form.setValue("expiry", formatExpiry(event.target.value), {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                      />
                      <p className="text-sm text-rose-500">{form.formState.errors.expiry?.message}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        inputMode="numeric"
                        placeholder="123"
                        value={form.watch("cvv")}
                        onChange={(event) =>
                          form.setValue("cvv", event.target.value.replace(/\D/g, "").slice(0, 4), {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                      />
                      <p className="text-sm text-rose-500">{form.formState.errors.cvv?.message}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Kart bilgileriniz yalnızca ön doğrulama için kullanılır. Asıl tahsilat İyzico 3D Secure ekranında güvenli
                    olarak tamamlanır.
                  </div>

                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" type="button" onClick={onBack} disabled={submitting}>
                      Geri
                    </Button>
                    <Button type="submit" loading={submitting} loadingText="Ödeme sayfası hazırlanıyor">
                      Çekimi Başlat
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                    Ödeme sistemi geçici olarak pasif. Kredi yükleme ve kartla ödeme canlıya alındığında burada aktif olacak.
                  </div>

                  {allowDemoWithoutCredits ? (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                      Krediniz olmadığı için bu adım demo modda ilerleyecek ve ödeme alınmayacak.
                    </div>
                  ) : null}

                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" type="button" onClick={onBack} disabled={submitting}>
                      Geri
                    </Button>
                    <Button
                      type="button"
                      loading={submitting}
                      loadingText="Çekim hazırlanıyor"
                      onClick={() => void handlePaymentSubmit()}
                    >
                      Demo Çekimini Başlat
                    </Button>
                  </div>
                </div>
              )}

              {(adminUser || canUseCredits) ? (
                <>
                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" type="button" onClick={onBack} disabled={submitting || showProcessing}>
                      Geri
                    </Button>
                    <Button
                      type="button"
                      loading={submitting}
                      loadingText="Çekim başlatılıyor"
                      disabled={showProcessing}
                      onClick={handleCreditSubmit}
                    >
                      Çekimi Başlat
                    </Button>
                  </div>
                </>
              ) : null}

            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2rem] border-slate-200">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Sipariş özeti</p>
                <h3 className="text-xl font-semibold text-slate-900">{selectedOption.title}</h3>
              </div>
              <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {formatCurrency(selectedOption.amount)}
              </div>
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-sm text-slate-500">Konum</p>
                <p className="mt-1 font-medium text-slate-900">
                  Ada {data.adaNo} / Parsel {data.parselNo}
                </p>
                <p className="text-sm text-slate-600">
                  {data.ilce}, {data.il}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Yakın çevre etiketleri</p>
                <p className="mt-1 font-medium text-slate-900">{data.nearbyLabels.length} adet seçili</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Seslendirme</p>
                <p className="mt-1 font-medium text-slate-900">
                  {data.voiceoverText.trim() ? "AI destekli metin hazır" : "Seslendirme eklenmedi"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedOption.features.map((feature) => (
                <div key={feature} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <span className="text-slate-600">{feature}</span>
                  <span className="font-semibold text-slate-900">Dahil</span>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-secondary" />
                <p className="font-semibold">Güvenli Ödeme</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <LockKeyhole className="h-4 w-4 text-secondary" />
                {paymentsAvailable
                  ? "SSL ve İyzico 3D Secure koruması ile ödeme alınır."
                  : "Ödeme akışı canlıya alınana kadar pasif durumda."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
