import { Resend } from "resend";

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function canSendEmails() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendWelcomeEmail(
  email: string,
  payload: { fullName?: string | null; credits: number }
) {
  if (!canSendEmails()) {
    return { skipped: true };
  }

  const resend = getResendClient();
  const greeting = payload.fullName?.trim() || "Merhaba";

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Drone360 Türkiye hesabınız hazır",
    html: `<div style="font-family: Arial, sans-serif; line-height:1.6">
      <h2>${greeting}, hoş geldiniz</h2>
      <p>Drone360 Türkiye hesabınız oluşturuldu.</p>
      <p>Başlangıç hediyesi olarak hesabınıza <strong>${payload.credits} ücretsiz kredi</strong> tanımlandı.</p>
      <p>Panelinize giriş yaparak ilk sanal çekiminizi hemen başlatabilirsiniz.</p>
    </div>`
  });
}

export async function sendPaymentSuccessEmail(email: string, payload: { planName: string; amount: number }) {
  if (!canSendEmails()) {
    return { skipped: true };
  }

  const resend = getResendClient();

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Drone360 kredi paketi satın alımınız tamamlandı",
    html: `<div style="font-family: Arial, sans-serif; line-height:1.6">
      <h2>Ödemeniz alındı</h2>
      <p><strong>${payload.planName}</strong> paketi hesabınıza tanımlandı.</p>
      <p>Tutar: ${payload.amount.toLocaleString("tr-TR")} TL</p>
      <p>Panelinize giriş yaparak yeni çekim oluşturmaya başlayabilirsiniz.</p>
    </div>`
  });
}
