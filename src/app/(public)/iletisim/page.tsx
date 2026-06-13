export const metadata = {
  title: "İletişim | Parselim",
  description: "Parselim ile iletişime geçin. Sorularınız için destek@parselim.com",
  alternates: { canonical: "https://parselim.com/iletisim" }
};

import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="container py-16">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">İletişim</p>
          <h1 className="section-heading">Kurumsal demo ve satış süreçleri için bize yazın</h1>
          <p className="section-copy">
            Hacminiz, ekip yapınız ve hedefiniz ne olursa olsun Türkiye odaklı kurulum planı hazırlayalım.
          </p>
          <div className="rounded-[2rem] border bg-card p-6 text-sm text-muted-foreground">
            <p>destek@parselim.com</p>
            <p className="mt-2">+90 850 000 36 36</p>
            <p className="mt-2">Maslak, İstanbul</p>
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
