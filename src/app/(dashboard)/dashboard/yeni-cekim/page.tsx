"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Step1Location } from "@/components/wizard/Step1Location";
import { Step2ShootType } from "@/components/wizard/Step2ShootType";
import { Step3Customize } from "@/components/wizard/Step3Customize";
import { Step4Labels } from "@/components/wizard/Step4Labels";
import { Step5Payment } from "@/components/wizard/Step5Payment";
import { WizardStepper } from "@/components/wizard/WizardStepper";
import { useWizardStore } from "@/store/wizardStore";

const stepMeta = [
  {
    title: "Konum Doğrulama",
    description: "Ada ve parsel bilgisiyle lokasyonu doğrulayın, harita önizlemesini kontrol edin."
  },
  {
    title: "Çekim Türü",
    description: "İhtiyacınıza göre drone, 3D tur veya kombine hizmet seçin."
  },
  {
    title: "Özelleştirme",
    description: "Marka görünümünüzü, iletişim numaranızı ve AI seslendirme metnini hazırlayın."
  },
  {
    title: "Yakın Çevre Etiketleri",
    description: "Google Places destekli otomatik etiketlerden seçin veya kendi vurgularınızı ekleyin."
  },
  {
    title: "Ödeme ve Onay",
    description: "Kredi kullanın veya güvenli ödeme ile çekimi başlatın."
  }
];

export default function NewShootPage() {
  const { currentStep, setStep } = useWizardStore();

  const next = () => setStep(Math.min(5, currentStep + 1));
  const back = () => setStep(Math.max(1, currentStep - 1));
  const currentMeta = stepMeta[currentStep - 1];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Yeni Çekim</p>
        <h1 className="text-3xl font-semibold text-slate-900">AI destekli sanal çekim sihirbazı</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          Konumu doğrulayın, çekim tipinizi seçin ve markanıza özel tanıtım içeriğini birkaç adımda tamamlayın.
        </p>
      </div>

      <WizardStepper currentStep={currentStep} />

      <Card className="rounded-[2rem] border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <p className="text-sm font-medium text-primary">
            Adım {currentStep} / {stepMeta.length}
          </p>
          <CardTitle className="text-2xl">{currentMeta.title}</CardTitle>
          <CardDescription>{currentMeta.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 ? <Step1Location onNext={next} /> : null}
          {currentStep === 2 ? <Step2ShootType onBack={back} onNext={next} /> : null}
          {currentStep === 3 ? <Step3Customize onBack={back} onNext={next} /> : null}
          {currentStep === 4 ? <Step4Labels onBack={back} onNext={next} /> : null}
          {currentStep === 5 ? <Step5Payment onBack={back} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
