import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Text
} from "@react-email/components";

type PaymentSuccessEmailProps = {
  fullName: string;
  amount: number;
  credits: number;
  invoiceUrl?: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const PRIMARY = "#1E3A8A";

export default function PaymentSuccessEmail({ fullName, amount, credits, invoiceUrl }: PaymentSuccessEmailProps) {
  const formattedAmount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(amount);

  return (
    <Html lang="tr">
      <Head />
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#ffffff",
          fontFamily: "Inter, Arial, sans-serif"
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px 24px",
            backgroundColor: "#ffffff"
          }}
        >
          <Img
            src="https://via.placeholder.com/150x50?text=TERRAMONY"
            alt="Terramony"
            width="150"
            height="50"
            style={{ display: "block", marginBottom: "24px" }}
          />

          <Heading
            style={{
              margin: "0 0 16px",
              color: PRIMARY,
              fontSize: "28px",
              lineHeight: "36px",
              fontWeight: "700"
            }}
          >
            Ödeme Başarılı ✅
          </Heading>

          <Text style={{ margin: "0 0 16px", color: "#334155", fontSize: "16px", lineHeight: "26px" }}>
            Merhaba {fullName}, ödeme işleminiz tamamlandı.
          </Text>

          <div
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "16px",
              padding: "16px 18px",
              marginBottom: "16px"
            }}
          >
            <Text style={{ margin: 0, color: "#166534", fontSize: "15px", lineHeight: "24px", fontWeight: 600 }}>
              {formattedAmount} tutarındaki ödemeniz alındı.
            </Text>
          </div>

          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "16px",
              padding: "16px 18px",
              marginBottom: "24px"
            }}
          >
            <Text style={{ margin: 0, color: "#1e3a8a", fontSize: "15px", lineHeight: "24px", fontWeight: 600 }}>
              {credits} çekim kredisi hesabınıza tanımlandı.
            </Text>
          </div>

          <Button
            href={`${APP_URL}/dashboard`}
            style={{
              backgroundColor: PRIMARY,
              color: "#ffffff",
              borderRadius: "9999px",
              padding: "14px 22px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            Dashboard&apos;a Git
          </Button>

          {invoiceUrl ? (
            <Text style={{ margin: "18px 0 0", fontSize: "14px", lineHeight: "22px" }}>
              <a href={invoiceUrl} style={{ color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>
                Faturayı İndir
              </a>
            </Text>
          ) : null}

          <Hr style={{ borderColor: "#e2e8f0", margin: "32px 0 20px" }} />

          <Text style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: "20px" }}>
            © 2024 Terramony. Tüm hakları saklıdır.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
