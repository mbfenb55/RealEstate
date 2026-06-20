"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

import { ProcessingOverlay } from "@/components/dashboard/ProcessingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";
import { PAYMENTS_ENABLED } from "@/lib/features";
import { formatCreditAmount, getRequiredCreditUnits, getShootOption } from "@/lib/shoot-options";
import { formatCurrency } from "@/lib/utils";
import { useWizardStore } from "@/store/wizardStore";

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Kart numarasini eksiksiz girin."),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Son kullanma tarihi AA/YY formatinda olmalidir."),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV 3 veya 4 haneli olmalidir.")
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
  const { data, patchData, reset, adminSessionBypass } = useWizardStore();
  const { profile, user, refreshProfile, loading: authLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const selectedOption = useMemo(() => getShootOption(data.shootType), [data.shootType]);
  const requiredCreditUnits = useMemo(() => getRequiredCreditUnits(data.shootType), [data.shootType]);
  const signedInUser = user ?? null;
  const adminUser = adminSessionBypass || isAdmin(profile?.email ?? signedInUser?.email ?? "");
  const canUseCredits = !adminUser && (profile?.credits ?? 0) >= requiredCreditUnits;
  const paymentsAvailable = PAYMENTS_ENABLED;
  const paymentRequired = !adminUser && !canUseCredits && paymentsAvailable;
  const allowDemoWithoutCredits = !adminUser && !canUseCredits && !paymentsAvailable;
  const requiresSession = !adminSessionBypass && !signedInUser;

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
    if (authLoading) {
      throw new Error("Oturum bilgileri yukleniyor. Lutfen birkac saniye sonra tekrar deneyin.");
    }

    const activeProfile = profile ?? (await refreshProfile(signedInUser ?? undefined));

    if (!activeProfile && !adminSessionBypass) {
      throw new Error("Oturum bilgisi yuklenemedi. Lutfen once giris yapin veya sayfayi yenileyin.");
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
        throw new Error(shootPayload.error ?? "Cekim kaydi olusturulamadi.");
      }

      createdShootId = shootPayload.item.id;

      if (adminUser || canUseCredits || !paymentsAvailable) {
        await refreshProfile(signedInUser ?? undefined);
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
        throw new Error(paymentPayload.error ?? "Odeme sayfasi baslatilamadi.");
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
      setSubmitError(error instanceof Error ? error.message : "Cekim baslatilamadi.");
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
      setSubmitError(error instanceof Error ? error.message : "Odeme baslatilamadi.");
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
                <h3 className="font-semibold text-slate-900">Siparis ve Teslimat Onayi</h3>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {adminUser
                    ? "Admin modu aktif"
                    : canUseCredits
                      ? `${requiredCreditUnits} kredi kullanilacak`
                      : "Kredi yetersiz, guvenli odeme gerekli"}
                </p>
                <p className="mt-2">
                  Secilen hizmet {formatCreditAmount(selectedOption.credits)} kredi degerindedir.
                  {selectedOption.type === "COMBO"
                    ? ` Kombine cekimler kredi bakiyesinde ${requiredCreditUnits} tam kredi olarak islenir.`
                    : null}
                </p>
              </div>

              {adminUser ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                  <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Admin modu - odeme atlandi
                  </div>
                  <p>Yonetici hesabi icin kredi kontrolu uygulanmaz. Cekimi dogrudan baslatabilirsiniz.</p>
                </div>
              ) : canUseCredits ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                  Hesabinizdaki kredi bu cekim icin yeterli. Onay verdiginiz anda cekim kaydi olusturulup isleme alinacaktir.
                </div>
              ) : paymentsAvailable ? (
                <form className="space-y-5" onSubmit={form.handleSubmit(handlePaymentSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Kart Numarasi</Label>
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
                    Kart bilgileriniz yalnizca on dogrulama icin kullanilir. Asil tahsilat Iyzico 3D Secure ekraninda guvenli
                    olarak tamamlanir.
                  </div>

                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" type="button" onClick={onBack} disabled={submitting || authLoading}>
                      Geri
                    </Button>
                    <Button
                      type="submit"
                      loading={submitting || authLoading}
                      loadingText={authLoading ? "Oturum yukleniyor" : "Odeme sayfasi hazirlaniyor"}
                    >
                      Cekimi Baslat
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                    Odeme sistemi gecici olarak pasif. Kredi yukleme ve kartla odeme canliya alindiginda burada aktif olacak.
                  </div>

                  {allowDemoWithoutCredits ? (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                      Krediniz olmadigi icin bu adim demo modda ilerleyecek ve odeme alinmayacak.
                    </div>
                  ) : null}

                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" type="button" onClick={onBack} disabled={submitting || authLoading}>
                      Geri
                    </Button>
                    <Button
                      type="button"
                      loading={submitting || authLoading}
                      loadingText={authLoading ? "Oturum yukleniyor" : "Cekim hazirlaniyor"}
                      onClick={() => void handlePaymentSubmit()}
                    >
                      Demo Cekimini Baslat
                    </Button>
                  </div>
                </div>
              )}

              {adminUser || canUseCredits ? (
                <>
                  {requiresSession ? (
                    <p className="text-sm text-amber-600">
                      Admin kolayligi yalnizca oturum acmis yonetici hesabi icin aktif olur. Lutfen once
                      {` `}
                      <strong>irfanrsln1@gmail.com</strong>
                      {` `}
                      ile giris yapin.
                    </p>
                  ) : null}
                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={onBack}
                      disabled={submitting || showProcessing || authLoading}
                    >
                      Geri
                    </Button>
                    <Button
                      type="button"
                      loading={submitting || authLoading}
                      loadingText={authLoading ? "Oturum yukleniyor" : "Cekim baslatiliyor"}
                      disabled={showProcessing || authLoading || requiresSession}
                      onClick={() => void handleCreditSubmit()}
                    >
                      Cekimi Baslat
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
                <p className="text-sm text-slate-500">Siparis ozeti</p>
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
                <p className="text-sm text-slate-500">Yakin cevre etiketleri</p>
                <p className="mt-1 font-medium text-slate-900">{data.nearbyLabels.length} adet secili</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Seslendirme</p>
                <p className="mt-1 font-medium text-slate-900">
                  {data.voiceoverText.trim() ? "AI destekli metin hazir" : "Seslendirme eklenmedi"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedOption.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <span className="text-slate-600">{feature}</span>
                  <span className="font-semibold text-slate-900">Dahil</span>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-secondary" />
                <p className="font-semibold">Guvenli Odeme</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <LockKeyhole className="h-4 w-4 text-secondary" />
                {paymentsAvailable
                  ? "SSL ve Iyzico 3D Secure korumasi ile odeme alinir."
                  : "Odeme akisi canliya alingana kadar pasif durumda."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
