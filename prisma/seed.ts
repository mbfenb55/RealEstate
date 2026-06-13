import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed işlemi başlıyor...");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@parselim.com" },
    update: {
      fullName: "Demo Kullanıcı",
      companyName: "Re/Max İstanbul",
      credits: 5
    },
    create: {
      email: "demo@parselim.com",
      fullName: "Demo Kullanıcı",
      companyName: "Re/Max İstanbul",
      credits: 5
    }
  });

  const testUser = await prisma.user.upsert({
    where: { email: "test@parselim.com" },
    update: {
      fullName: "Test Danışman",
      companyName: "Century 21",
      credits: 2
    },
    create: {
      email: "test@parselim.com",
      fullName: "Test Danışman",
      companyName: "Century 21",
      credits: 2
    }
  });

  const demoShoots = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      adaNo: "125",
      parselNo: "8",
      il: "İstanbul",
      ilce: "Kadıköy",
      type: "DRONE" as const,
      status: "READY" as const,
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      viewCount: 47
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      adaNo: "89",
      parselNo: "12",
      il: "İzmir",
      ilce: "Karşıyaka",
      type: "TOUR_3D" as const,
      status: "READY" as const,
      viewCount: 23
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      adaNo: "201",
      parselNo: "5",
      il: "Ankara",
      ilce: "Çankaya",
      type: "COMBO" as const,
      status: "PROCESSING" as const,
      viewCount: 0
    }
  ];

  for (const shoot of demoShoots) {
    await prisma.shoot.upsert({
      where: { id: shoot.id },
      update: {
        userId: demoUser.id,
        adaNo: shoot.adaNo,
        parselNo: shoot.parselNo,
        il: shoot.il,
        ilce: shoot.ilce,
        type: shoot.type,
        status: shoot.status,
        videoUrl: shoot.videoUrl ?? null,
        viewCount: shoot.viewCount,
        completedAt: shoot.status === "READY" ? new Date() : null
      },
      create: {
        id: shoot.id,
        userId: demoUser.id,
        adaNo: shoot.adaNo,
        parselNo: shoot.parselNo,
        il: shoot.il,
        ilce: shoot.ilce,
        type: shoot.type,
        status: shoot.status,
        videoUrl: shoot.videoUrl ?? null,
        viewCount: shoot.viewCount,
        completedAt: shoot.status === "READY" ? new Date() : null
      }
    });
  }

  console.log(`Kullanıcılar oluşturuldu: ${demoUser.email}, ${testUser.email}`);
  console.log("3 demo çekim hazırlandı.");
  console.log("Seed işlemi başarıyla tamamlandı.");
}

main()
  .catch((error) => {
    console.error("Seed işlemi başarısız oldu:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
