import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Configuração do Supabase Admin (necessário para upload no storage se RLS for restritivo)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração do Cliente Google TTS
// Tenta carregar das variáveis de ambiente individuais (Vercel) ou usa as credenciais padrão do ambiente
let clientOptions: any = {};

if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PROJECT_ID) {
  clientOptions.credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
  clientOptions.projectId = process.env.GOOGLE_PROJECT_ID;
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Opcional: Se a variável apontar para um arquivo físico
}

const client = new textToSpeech.TextToSpeechClient(clientOptions);

export async function POST(req: NextRequest) {
  try {
    const { newsId, title, subtitle, content, rate = 1.05 } = await req.json();

    if (!newsId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Gerar Hash do conteúdo para controle de cache
    const contentToHash = `${title}|${subtitle || ""}|${content}`;
    const contentHash = crypto.createHash("md5").update(contentToHash).digest("hex");

    // 2. Verificar no banco se o áudio já existe e se o hash é o mesmo
    const { data: newsData, error: dbError } = await supabase
      .from("noticias")
      .select("audio_url, audio_content_hash")
      .eq("id", newsId)
      .single();

    if (newsData?.audio_url && newsData?.audio_content_hash === contentHash) {
      console.log(`[TTS] Cache hit for news ${newsId}`);
      return NextResponse.json({ audioUrl: newsData.audio_url });
    }

    console.log(`[TTS] Cache miss or update for news ${newsId}. Generating new audio...`);

    // 3. Construir SSML para prosódia avançada (Estilo CNN)
    const ssml = `
      <speak>
        <p>
          <s><prosody rate="0.85" pitch="+1st">${title}</prosody></s>
          <break time="800ms"/>
          ${subtitle ? `<s><prosody rate="0.95" pitch="0st">${subtitle}</prosody></s><break time="1s"/>` : ""}
        </p>
        <p>
          <prosody rate="${rate}" pitch="-1st">
            ${content}
          </prosody>
        </p>
        <break time="1s"/>
        <p><s>Este foi um giro de notícias no Portal Nossa Web TV.</s></p>
      </speak>
    `;

    // 4. Chamada para o Google Cloud TTS
    const [response] = await client.synthesizeSpeech({
      input: { ssml },
      voice: { 
        languageCode: "pt-BR", 
        name: "pt-BR-Neural2-B", // Voz Masculina Premium solicitada
        ssmlGender: "MALE" 
      },
      audioConfig: { 
        audioEncoding: "MP3",
        effectsProfileId: ["small-bluetooth-speaker-class-device"] // Otimizado para dispositivos móveis
      },
    });

    const audioContent = response.audioContent;
    if (!audioContent) throw new Error("Falha ao gerar áudio");

    // 5. Upload para Supabase Storage (Bucket: audio-narracao)
    const fileName = `${newsId}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-narracao")
      .upload(fileName, audioContent, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 6. Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from("audio-narracao")
      .getPublicUrl(fileName);

    // 7. Atualizar a tabela de notícias com a nova URL e o novo Hash
    const { error: updateError } = await supabase
      .from("noticias")
      .update({
        audio_url: publicUrl,
        audio_content_hash: contentHash
      })
      .eq("id", newsId);

    if (updateError) console.error("Erro ao atualizar banco com audio_url:", updateError);

    return NextResponse.json({ audioUrl: publicUrl });

  } catch (error: any) {
    console.error("[TTS Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
