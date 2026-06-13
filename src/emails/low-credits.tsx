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

type LowCreditsEmailProps = {
  fullName: string;
  remainingCredits: number;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const PRIMARY = "#1E3A8A";

export default function LowCreditsEmail({ fullName, remainingCredits }: LowCreditsEmailProps) {
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
            Krediniz Azalıyor ⚠️
          </Heading>

          <Text style={{ margin: "0 0 16px", color: "#334155", fontSize: "16px", lineHeight: "26px" }}>
            Merhaba {fullName}, hesabınızda yalnızca {remainingCredits} çekim kredisi kaldı.
          </Text>

          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #f59e0b",
              borderRadius: "16px",
              padding: "16px 18px",
              marginBottom: "24px"
            }}
          >
            <Text style={{ margin: 0, color: "#92400e", fontSize: "15px", lineHeight: "24px", fontWeight: 600 }}>
              Yeni çekim yapabilmek için kredi satın alın.
            </Text>
          </div>

          <Button
            href={`${APP_URL}/dashboard/paketler`}
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
            Kredi Satın Al
          </Button>

          <Hr style={{ borderColor: "#e2e8f0", margin: "32px 0 20px" }} />

          <Text style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: "20px" }}>
            © 2024 Terramony. Tüm hakları saklıdır.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
