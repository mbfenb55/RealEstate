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

type WelcomeEmailProps = {
  fullName: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const PRIMARY = "#1E3A8A";

export default function WelcomeEmail({ fullName }: WelcomeEmailProps) {
  return (
    <Html lang="tr">
      <Head />
      <Body
        style={{
          margin: 0,
          padding: "0",
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
            src="https://via.placeholder.com/150x50?text=PARSELİM"
            alt="Parselim"
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
            Hoş Geldin, {fullName}! 🎉
          </Heading>

          <Text
            style={{
              margin: "0 0 24px",
              color: "#334155",
              fontSize: "16px",
              lineHeight: "26px"
            }}
          >
            Parselim&apos;e katıldığın için teşekkürler. Hesabına 1 ücretsiz çekim kredisi tanımlandı.
          </Text>

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

          <Hr style={{ borderColor: "#e2e8f0", margin: "32px 0 20px" }} />

          <Text style={{ margin: "0 0 8px", color: "#475569", fontSize: "14px", lineHeight: "22px" }}>
            Soruların için: destek@parselim.com
          </Text>

          <Text style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: "20px" }}>
            © 2024 Parselim. Tüm hakları saklıdır.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
