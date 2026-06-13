export const landingNavItems = [
  { href: "/#hero", label: "Anasayfa", hash: "#hero" },
  { href: "/#nasil-calisir", label: "Nasıl Çalışır", hash: "#nasil-calisir" },
  { href: "/#hizmetler", label: "Hizmetler", hash: "#hizmetler" },
  { href: "/#ozellikler", label: "Özellikler", hash: "#ozellikler" },
  { href: "/#fiyatlar", label: "Fiyatlar", hash: "#fiyatlar" },
  { href: "/#sss", label: "SSS", hash: "#sss" }
] as const;

export const heroAvatars = [
  "https://ui-avatars.com/api/?name=Ayse+Yilmaz&background=1E3A8A&color=fff",
  "https://ui-avatars.com/api/?name=Mert+Kaya&background=F59E0B&color=0F172A",
  "https://ui-avatars.com/api/?name=Selin+Aras&background=0F172A&color=fff",
  "https://ui-avatars.com/api/?name=Can+Demir&background=334155&color=fff"
];

export const featureTabs = [
  {
    id: "kamera",
    title: "AI Otomatik Kamera Uçuşu",
    description:
      "Ada ve parsel verisine göre kameranın yaklaşım, yükseklik ve dönüş rotasını otomatik planlayın.",
    bullets: [
      "Parsel sınırına göre akıllı rota",
      "Satış odağına göre açı önerileri",
      "Hızlı preview storyboard"
    ],
    accentLabel: "10 dakikalık teslim akışı",
    stats: [
      { label: "Rota doğruluğu", value: "%94" },
      { label: "Ortalama kurgu süresi", value: "6 dk" },
      { label: "Hazır kamera sahnesi", value: "12 sahne" }
    ]
  },
  {
    id: "etiketler",
    title: "3D Harita & Etiketler",
    description:
      "Parsel, yol, deniz, ulaşım aksı ve önemli nokta etiketlerini videoya ve görsel tura otomatik ekleyin.",
    bullets: [
      "Mapbox tabanlı 3D yükseklik görünümü",
      "Mahalle ve lokasyon etiketleri",
      "Satışta öne çıkan yakınlık noktaları"
    ],
    accentLabel: "3D görünüm ve yakınlık katmanı",
    stats: [
      { label: "Etiket seti", value: "25+" },
      { label: "Paylaşım formatı", value: "Video + Link" },
      { label: "Güncellenebilir katman", value: "Anlık" }
    ]
  },
  {
    id: "marka",
    title: "Kurumsal Logo & Telefon",
    description:
      "Her çekimi danışman ya da marka bazında kişiselleştirip teslim edin. Logo, telefon ve marka rengi otomatik işlenir.",
    bullets: [
      "Tek tıkla kurumsal kimlik uygulama",
      "Acenta bazlı şablonlar",
      "White-label teslim ekranı"
    ],
    accentLabel: "Kurumsal görünüm",
    stats: [
      { label: "Logo desteği", value: "PNG / SVG" },
      { label: "Renk varyasyonu", value: "Sınırsız" },
      { label: "Teslim markalama", value: "%100" }
    ]
  },
  {
    id: "seslendirme",
    title: "AI Türkçe Seslendirme",
    description:
      "OpenAI ile metni, ElevenLabs ile Türkçe sesi üretin. Portföy tipi ve hedef kitleye göre farklı tonlar kullanın.",
    bullets: [
      "Yatırımcı ve aile odaklı varyantlar",
      "Kısa, akıcı Türkçe anlatım",
      "Videoya hazır MP3 teslim"
    ],
    accentLabel: "Hazır sesli anlatım",
    stats: [
      { label: "Dil", value: "Türkçe" },
      { label: "Ses profili", value: "6 ton" },
      { label: "Metin üretimi", value: "AI destekli" }
    ]
  },
  {
    id: "paylasim",
    title: "Anlık Paylaşım",
    description:
      "Üretilen turu WhatsApp, Instagram ve Sahibinden odaklı kısa linklerle anında paylaşın.",
    bullets: [
      "Mobil uyumlu landing linki",
      "Kopyala-gönder iş akışı",
      "Danışman bazlı görüntülenme takibi"
    ],
    accentLabel: "Sosyal dağıtım",
    stats: [
      { label: "Dağıtım kanalı", value: "3+" },
      { label: "Tek link paylaşım", value: "Var" },
      { label: "Mobil optimizasyon", value: "%100" }
    ]
  },
  {
    id: "analiz",
    title: "Arsa & İmar Analizi",
    description:
      "Arsa için lokasyon potansiyeli, erişim avantajı ve pazarlama çıkarımlarını tek raporda sunun.",
    bullets: [
      "İl / ilçe bazlı pazar özeti",
      "Yakınlık ve erişim skoru",
      "Video anlatımına uygun özet"
    ],
    accentLabel: "Analiz raporu",
    stats: [
      { label: "Rapor özeti", value: "1 sayfa" },
      { label: "Konum skoru", value: "Canlı" },
      { label: "Teslim formatı", value: "PDF + JSON" }
    ]
  }
] as const;

export const landingPricing = [
  {
    name: "Starter",
    price: "399 TL/çekim",
    badge: null,
    highlighted: false,
    features: [
      { text: "1 Sanal Drone Videosu", included: true },
      { text: "Standart Kalite (1080p)", included: true },
      { text: "Logo & Telefon Ekleme", included: true },
      { text: "AI Seslendirme", included: false },
      { text: "3D Sanal Tur", included: false },
      { text: "Arsa Analizi", included: false }
    ]
  },
  {
    name: "Profesyonel",
    price: "799 TL/çekim",
    badge: "POPULAR",
    highlighted: true,
    features: [
      { text: "HD Video (4K)", included: true },
      { text: "AI Türkçe Seslendirme", included: true },
      { text: "3D Sanal Tur", included: true },
      { text: "Arsa Analizi Raporu", included: true },
      { text: "Logo & Telefon & Marka Rengi", included: true },
      { text: "Öncelikli Teslimat", included: true }
    ]
  },
  {
    name: "Kurumsal",
    price: "Özel Fiyat",
    badge: null,
    highlighted: false,
    features: [
      { text: "Tüm Profesyonel özellikler", included: true },
      { text: "Toplu Paket İndirimi", included: true },
      { text: "API Erişimi", included: true },
      { text: "Beyaz Etiket (White Label)", included: true },
      { text: "Özel Destek Hattı", included: true },
      { text: "Aylık Fatura", included: true }
    ]
  }
] as const;

export const landingStats = [
  { label: "Kayıtlı Danışman", value: 3000, suffix: "+" },
  { label: "Ortalama Teslimat", value: 10, suffix: " dk" },
  { label: "Dönüşüm Artışı", value: 40, prefix: "%" },
  { label: "İlde Hizmet", value: 81 }
] as const;

export const testimonials = [
  {
    name: "Ayşe Karataş",
    title: "Re/Max Danışmanı",
    avatar: "https://ui-avatars.com/api/?name=Ayse+Karatas&background=1E3A8A&color=fff",
    quote:
      "Ada-parsel bilgisini girdikten sonra videonun bu kadar hızlı çıkması satış sunumlarımızı ciddi biçimde hızlandırdı."
  },
  {
    name: "Mert Önal",
    title: "Coldwell Banker Danışmanı",
    avatar: "https://ui-avatars.com/api/?name=Mert+Onal&background=0F172A&color=fff",
    quote:
      "3D tur ve Türkçe seslendirme aynı pakette olunca ilanlarımız çok daha profesyonel görünmeye başladı."
  },
  {
    name: "Selin Durmuş",
    title: "Arsa Yatırım Uzmanı",
    avatar: "https://ui-avatars.com/api/?name=Selin+Durmus&background=F59E0B&color=0F172A",
    quote:
      "Arsa analizi raporu müşteriye güven veriyor. Video ile birlikte tek link göndermek işimizi kolaylaştırdı."
  },
  {
    name: "Caner Gül",
    title: "Emlak Ofisi Kurucusu",
    avatar: "https://ui-avatars.com/api/?name=Caner+Gul&background=334155&color=fff",
    quote:
      "Kurumsal logo, telefon ve marka rengi otomatik işlendiği için her çekimde ekipten zaman kazanıyoruz."
  },
  {
    name: "Ebru Şahin",
    title: "Lüks Konut Danışmanı",
    avatar: "https://ui-avatars.com/api/?name=Ebru+Sahin&background=7C3AED&color=fff",
    quote:
      "Özellikle villa portföylerinde yapay zeka kamera rotası ve sahne akışı müşteri tarafında fark yaratıyor."
  },
  {
    name: "Onur Kılıç",
    title: "Sahibinden Portföy Yöneticisi",
    avatar: "https://ui-avatars.com/api/?name=Onur+Kilic&background=2563EB&color=fff",
    quote:
      "WhatsApp paylaşım linki ve hızlı teslim sayesinde sıcak müşteriyle iletişim süremiz ciddi biçimde kısaldı."
  }
] as const;

export const faqItems = [
  {
    question: "İlk çekim gerçekten ücretsiz mi?",
    answer: "Evet. Kredi kartı girmeden ilk çekiminizi deneyebilir, çıktı kalitesini gördükten sonra paket seçebilirsiniz."
  },
  {
    question: "Video ne kadar sürede hazırlanıyor?",
    answer: "Standart çekimlerde teslim süresi ortalama 10 dakikadır. Profesyonel ve kurumsal paketlerde öncelikli işleme uygulanır."
  },
  {
    question: "Sadece ada-parsel numarası ile işlem başlatabilir miyim?",
    answer: "Evet. Sistem ada-parsel girdisini lokasyon ve arsa akışı için başlangıç verisi olarak kullanır."
  },
  {
    question: "3D sanal tur hangi pakette geliyor?",
    answer: "3D sanal tur Profesyonel ve Kurumsal paketlerde dahildir."
  },
  {
    question: "Videolara logo ve telefon ekleyebiliyor muyum?",
    answer: "Evet. Starter paketten itibaren logo ve telefon bilgisi eklenebilir; marka rengi desteği üst paketlerde genişler."
  },
  {
    question: "AI Türkçe seslendirme nasıl çalışıyor?",
    answer: "Portföy bilgileriyle metin OpenAI üzerinden hazırlanır, ses ise ElevenLabs üzerinden Türkçe olarak üretilir."
  },
  {
    question: "Hazırlanan turları nerelerde paylaşabilirim?",
    answer: "WhatsApp, Instagram, Sahibinden ve diğer dijital kanallarda tek link veya video dosyası olarak paylaşabilirsiniz."
  },
  {
    question: "Kurumsal kullanım için API veya white-label destek var mı?",
    answer: "Evet. Kurumsal pakette API erişimi, white-label teslim ekranı ve özel destek hattı sunulur."
  }
] as const;
