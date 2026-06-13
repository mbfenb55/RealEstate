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

type ShootReadyEmailProps = {
  fullName: string;
  shootId: string;
  location: string;
  videoUrl: string;
};

const PRIMARY = "#1E3A8A";

export default function ShootReadyEmail({ fullName, shootId, location, videoUrl }: ShootReadyEmailProps) {
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
            Videonuz Hazır! 🎬
          </Heading>

          <Text style={{ margin: "0 0 16px", color: "#334155", fontSize: "16px", lineHeight: "26px" }}>
            Merhaba {fullName}, {location} konumuna ait çekiminiz tamamlandı.
          </Text>

          <div
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "16px",
              padding: "16px 18px",
              marginBottom: "24px"
            }}
          >
            <Text style={{ margin: 0, color: "#166534", fontSize: "15px", lineHeight: "24px", fontWeight: 600 }}>
              ✅ Video başarıyla oluşturuldu
            </Text>
            <Text style={{ margin: "8px 0 0", color: "#166534", fontSize: "14px", lineHeight: "22px" }}>
              Çekim ID: {shootId}
            </Text>
          </div>

          <Button
            href={videoUrl}
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
            Videoyu İzle &amp; İndir
          </Button>

          <Text style={{ margin: "24px 0 0", color: "#475569", fontSize: "14px", lineHeight: "22px" }}>
            Video 30 gün boyunca sistemde saklanacaktır.
          </Text>

          <Hr style={{ borderColor: "#e2e8f0", margin: "32px 0 20px" }} />

          <Text style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: "20px" }}>
            © 2024 Terramony. Tüm hakları saklıdır.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
