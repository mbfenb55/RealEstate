import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { il, ilce, adaNo, parselNo, nearbyLabels } = await req.json()

    // OpenAI API key yoksa veya quota yoksa mock yanıt döndür
    const mockText = `${il} ili, ${ilce} ilçesinde yer alan ${adaNo} ada ${parselNo} parsel numaralı bu eşsiz arsa, stratejik konumuyla yatırımcılar için büyük fırsatlar sunmaktadır. ${nearbyLabels?.join(', ')} gibi önemli noktalara yakın mesafede bulunan bu değerli arsa, gelişen bölgesiyle birlikte her geçen gün değer kazanmaktadır. Yüksek imar potansiyeli ve ulaşım kolaylığıyla öne çıkan bu arsayı kaçırmayın. Detaylı bilgi ve randevu için hemen arayın.`

    // Gerçek OpenAI entegrasyonu için OPENAI_API_KEY ve kredi gerekli
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey && !apiKey.includes('placeholder') && apiKey.startsWith('sk-')) {
      try {
        const { OpenAI } = await import('openai')
        const openai = new OpenAI({ apiKey })
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content: 'Sen deneyimli bir Türk emlak danışmanısın. Verilen arsa konumu için 45-60 saniyelik, ikna edici, profesyonel bir video seslendirme metni yaz. Sadece metni yaz, başka hiçbir şey ekleme.'
            },
            {
              role: 'user',
              content: `İl: ${il}, İlçe: ${ilce}, Ada: ${adaNo}, Parsel: ${parselNo}, Yakın çevre: ${nearbyLabels?.join(', ')}`
            }
          ]
        })
        return NextResponse.json({ text: completion.choices[0].message.content })
      } catch {
        // Quota veya başka hata — mock'a düş
      }
    }

    return NextResponse.json({ text: mockText })
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}