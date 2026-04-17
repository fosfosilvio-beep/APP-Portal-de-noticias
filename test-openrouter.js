const apiKey = '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';
const systemPrompt = `Você é um experiente jornalista sênior local trabalhando no Portal Nossa Web TV, focado nas notícias de Arapongas e região.
Sua tarefa é receber um texto bruto, link de testemunha ou ideia de pauta, e redigir uma matéria absolutamente profissional.
Você deve responder OBRIGATORIAMENTE em formato JSON válido e puro. Não adicione textos adicionais antes ou depois.
A estrutura do objeto JSON deve corresponder exatamente as chaves abaixo:
{
  "titulo": "Título muito chamativo e profissional (curto e direto)",
  "subtitulo": "Um resumo curto (linha fina) que complementa o título",
  "conteudo": "A notícia completa e muito bem redigida com introdução, desenvolvimento e fim (mínimo de 3 parágrafos fluídos). Não use markdown, coloque o texto diretamente.",
  "categoria": "Classifique em exata UMA destas opções fixas: Arapongas, Esportes, Polícia, Política, Geral"
}`;

async function run() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://nossawebtv.vercel.app', 
        'X-Title': 'Portal Nossa Web TV',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Fato a ser noticiado:\n\nhttp://facebook.com/familiasnovas/videos/2395444550964647/' }
        ]
      })
    });
    const text = await res.text();
    const fs = require('fs');
    fs.writeFileSync('debug-open.txt', 'STATUS: ' + res.status + '\nBODY: ' + text);
  } catch (e) {
    const fs = require('fs');
    fs.writeFileSync('debug-open.txt', 'ERR: ' + e);
  }
}
run();
