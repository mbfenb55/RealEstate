import { z } from "zod";

import { createSpeech } from "@/lib/elevenlabs";

const schema = z.object({
  text: z.string().min(10),
  voiceId: z.string().optional(),
  modelId: z.string().optional()
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const audio = await createSpeech(payload);

  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'inline; filename="voiceover.mp3"',
      "Cache-Control": "no-store"
    }
  });
}
