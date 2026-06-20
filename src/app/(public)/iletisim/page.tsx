import ContactForm from "./ContactForm";

import { getAppUrl } from "@/lib/env";

const appUrl = getAppUrl();

export const metadata = {
  title: "Iletisim | Parselim",
  description: "Parselim ile iletisime gecin. Sorulariniz icin destek@parselim.com",
  alternates: { canonical: `${appUrl}/iletisim` }
};

export default function ContactPage() {
  return (
    <main className="container py-16">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Iletisim</p>
          <h1 className="section-heading">Kurumsal demo ve satis surecleri icin bize yazin</h1>
          <p className="section-copy">
            Hacminiz, ekip yapiniz ve hedefiniz ne olursa olsun Turkiye odakli kurulum plani hazirlayalim.
          </p>
          <div className="rounded-[2rem] border bg-card p-6 text-sm text-muted-foreground">
            <p>destek@parselim.com</p>
            <p className="mt-2">+90 850 000 36 36</p>
            <p className="mt-2">Maslak, Istanbul</p>
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
