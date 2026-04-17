import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Se a chave não estiver configurada, retornamos um Mock (rascunho falso) para o usuário poder testar a tela
    if (!apiKey || apiKey === '') {
      return NextResponse.json({
        titulo: "Notícia Gerada por IA (Modo de Teste)",
        subtitulo: "Configure a ANTHROPIC_API_KEY no arquivo .env.local para habilitar a inteligência artificial real.",
        conteudo: `(Esta é uma simulação gerada de forma offline pois a sua chave de API não foi detectada. Quando a chave for informada, o modelo Claude escreverá de fato um texto embasado na sua ideia).\n\nSua ideia original foi: "${prompt}"\n\nNesta área ficaria o corpo extenso da notícia escrito diretamente pela IA, formatado perfeitamente em parágrafos e aderente ao estilo de jornalismo limpo do Portal Nossa Web TV.`
      });
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.7,
      system: "Você é um dos principais jornalistas do 'Portal Nossa Web TV', sediado em Arapongas, atuando com extrema seriedade e escrita cativante. Responda **APENAS** com um objeto JSON válido (sem markdown extra, nem texto antes ou depois). O JSON deve conter três chaves exatas: 'titulo' (título atraente da matéria), 'subtitulo' (linha fina complementar ao título, sem ponto final) e 'conteudo' (a matéria em si, em múltiplos parágrafos utilizando quebras de linha \\n\\n).",
      messages: [
        {
          role: 'user',
          content: `Escreva uma matéria jornalística focada nesta pauta/link/ideia: ${prompt}`,
        },
      ],
    });

    const textContent = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Tratamento para garantir que se o Claude colocar "```json", vamos pegar apenas dentro das chaves.
    const jsonStrMatch = textContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonStrMatch ? jsonStrMatch[0] : textContent;
    
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Erro na Geração de Notícia (Claude):", error);
    return NextResponse.json({ error: error.message || 'Erro interno ao gerar notícia.' }, { status: 500 });
  }
}
