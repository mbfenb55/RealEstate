type TextToSpeechInput = {
  text: string;
  voiceId?: string;
  modelId?: string;
  languageCode?: string;
};

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function createSpeech({
  text,
  voiceId = process.env.ELEVENLABS_VOICE_ID,
  modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
  languageCode = "tr"
}: TextToSpeechInput) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is missing.");
  }

  if (!voiceId) {
    throw new Error("ELEVENLABS_VOICE_ID is missing.");
  }

  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        language_code: languageCode,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.25,
          use_speaker_boost: true
        }
      })
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${errorBody}`);
  }

  return response.arrayBuffer();
}
