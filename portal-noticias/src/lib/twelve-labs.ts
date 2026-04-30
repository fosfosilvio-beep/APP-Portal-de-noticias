import axios from "axios";
import FormData from "form-data";

const API_KEY = process.env.TWELVE_LABS_API_KEY;
const VERSIONS = ["v1", "v1.2", "v1.1"];

/**
 * Módulo de Integração Twelve Labs (Pegasus-1)
 */
export const twelveLabs = {
  /**
   * Obtém ou cria um Index com fallback de versão.
   */
  async getOrCreateIndex(indexName = "Portal_NossaWeb") {
    if (!API_KEY) {
      console.error("[TwelveLabs] CRÍTICO: Chave não encontrada no process.env");
      throw new Error("TWELVE_LABS_API_KEY não encontrada no ambiente .env. Cadastre na Vercel.");
    }

    // Log de segurança para conferência
    const maskedKey = `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`;
    console.log(`[TwelveLabs] Iniciando com chave: ${maskedKey}`);

    let lastErr = null;

    for (const version of VERSIONS) {
      const baseUrl = `https://api.twelvelabs.io/${version}`;
      try {
        console.log(`[TwelveLabs] Testando endpoint: ${baseUrl}/indexes`);
        const res = await axios.get(`${baseUrl}/indexes`, {
          headers: { "x-api-key": API_KEY.trim() }
        });
        
        const indexes = res.data.data || [];
        const existing = indexes.find((idx: any) => idx.index_name === indexName);
        
        if (existing) {
          console.log(`[TwelveLabs] Sucesso em ${version}! ID: ${existing._id}`);
          return { indexId: existing._id, version };
        }

        console.log(`[TwelveLabs] Criando Index em ${version}...`);
        const createRes = await axios.post(`${baseUrl}/indexes`, {
          index_name: indexName,
          engines: [
            { engine_name: "marengo-2.6", engine_options: ["visual", "conversation"] },
            { engine_name: "pegasus-1", engine_options: ["visual", "conversation"] }
          ]
        }, {
          headers: { "x-api-key": API_KEY.trim() }
        });

        return { indexId: createRes.data._id, version };
      } catch (err: any) {
        lastErr = err;
        console.warn(`[TwelveLabs] Falha em ${version}: Status ${err.response?.status}`);
        if (err.response?.status === 404 || err.response?.status === 401) {
          continue;
        }
        break; 
      }
    }
    
    throw lastErr;
  },

  /**
   * Envia um vídeo via Multipart Form Data para indexação.
   * @param indexId ID do Index
   * @param videoBuffer Buffer do vídeo baixado
   * @param fileName Nome do arquivo
   */
  async submitTaskDirect(indexId: string, videoBuffer: Buffer, fileName: string, version = "v1") {
    const baseUrl = `https://api.twelvelabs.io/${version}`;
    try {
      console.log(`[TwelveLabs] Upload direto (${version}) para Index: ${indexId}`);
      const form = new FormData();
      form.append("index_id", indexId);
      form.append("video_file", videoBuffer, { filename: fileName });
      form.append("language", "pt");

      const res = await axios.post(`${baseUrl}/tasks`, form, {
        headers: { 
          ...form.getHeaders(),
          "x-api-key": API_KEY 
        }
      });
      return res.data._id;
    } catch (err: any) {
      const errorData = err.response?.data;
      console.error(`[TwelveLabs] Erro Upload (${version}):`, JSON.stringify(errorData, null, 2));
      throw new Error(`Upload Error (${version}): ${errorData?.message || err.message}`);
    }
  },

  /**
   * Aguarda a conclusão da indexação (Polling).
   */
  async waitForTask(taskId: string, version = "v1") {
    const baseUrl = `https://api.twelvelabs.io/${version}`;
    let status = "pending";
    
    while (status !== "ready" && status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const res = await axios.get(`${baseUrl}/tasks/${taskId}`, {
        headers: { "x-api-key": API_KEY }
      });
      status = res.data.status;
      console.log(`[TwelveLabs] Status Task ${taskId} (${version}): ${status}`);
      if (status === "failed") throw new Error("Indexação falhou na Twelve Labs.");
    }

    const resFinal = await axios.get(`${baseUrl}/tasks/${taskId}`, {
      headers: { "x-api-key": API_KEY }
    });
    return resFinal.data.video_id;
  },

  /**
   * Gera o conteúdo jornalístico usando Pegasus.
   */
  async generateContent(videoId: string, prompt: string, version = "v1") {
    const baseUrl = `https://api.twelvelabs.io/${version}`;
    try {
      console.log(`[TwelveLabs] Pegasus (${version}) para VideoID: ${videoId}`);
      const res = await axios.post(`${baseUrl}/generate`, {
        video_id: videoId,
        prompt: prompt
      }, {
        headers: { "x-api-key": API_KEY }
      });
      return res.data.data;
    } catch (err: any) {
      const errorData = err.response?.data;
      console.error(`[TwelveLabs] Erro Pegasus (${version}):`, JSON.stringify(errorData, null, 2));
      throw new Error(`Pegasus Error (${version}): ${errorData?.message || err.message}`);
    }
  }
};
