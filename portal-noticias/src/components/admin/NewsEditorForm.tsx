"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Send, Loader2, Save, Sparkles, FileText, Palette, 
  Type as TypeIcon, Hash, Globe, MousePointer2 
} from "lucide-react";
import RichTextEditor from "../RichTextEditor";

interface StyleConfig {
  font: string;
  weight: string;
  color: string;
}

const DEFAULT_CONFIG: StyleConfig = {
  font: "var(--font-inter)",
  weight: "900",
  color: "default"
};

const SUBTITLE_DEFAULT: StyleConfig = {
  font: "var(--font-inter)",
  weight: "400",
  color: "default"
};

interface NewsEditorFormProps {
  editId?: string;
  onSuccess?: () => void;
}

export default function NewsEditorForm({ editId, onSuccess }: NewsEditorFormProps) {
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Estados dos Campos
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [slug, setSlug] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [seoTags, setSeoTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  
  const [tituloConfig, setTituloConfig] = useState<StyleConfig>(DEFAULT_CONFIG);
  const [subtituloConfig, setSubtituloConfig] = useState<StyleConfig>(SUBTITLE_DEFAULT);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Efeito para carregar dados de edição
  useEffect(() => {
    if (editId) {
      loadNewsData();
    } else {
      // Tentar recuperar rascunho do localStorage se não for edição
      const rascunho = localStorage.getItem("news_draft");
      if (rascunho) {
        try {
          const data = JSON.parse(rascunho);
          setTitulo(data.titulo || "");
          setSubtitulo(data.subtitulo || "");
          setConteudo(data.conteudo || "");
          setCategoria(data.categoria || "");
          setSlug(data.slug || "");
          setImagemUrl(data.imagemUrl || "");
        } catch (e) {}
      }
    }
  }, [editId]);

  // Auto-save a cada 30 segundos (apenas para novas postagens)
  useEffect(() => {
    if (editId) return;
    const interval = setInterval(() => {
      const draft = { titulo, subtitulo, conteudo, categoria, slug, imagemUrl };
      localStorage.setItem("news_draft", JSON.stringify(draft));
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [titulo, subtitulo, conteudo, categoria, slug, imagemUrl, editId]);

  const loadNewsData = async () => {
    try {
      const { data, error } = await supabase.from("noticias").select("*").eq("id", editId).single();
      if (error) throw error;
      if (data) {
        setTitulo(data.titulo);
        setSubtitulo(data.subtitulo || "");
        setConteudo(data.conteudo);
        setCategoria(data.categoria || "");
        setSlug(data.slug);
        setImagemUrl(data.imagem_capa || "");
        setSeoTags(data.seo_tags || "");
        setExistingVideoUrl(data.video_url || "");
        if (data.titulo_config) setTituloConfig(data.titulo_config);
        if (data.subtitulo_config) setSubtituloConfig(data.subtitulo_config);
      }
    } catch (err: any) {
      alert("Erro ao carregar notícia: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    const clean = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    setSlug(clean);
  };

  const handlePublish = async () => {
    if (!titulo.trim() || !conteudo.trim() || !slug.trim()) {
      alert("Título, Conteúdo e Slug são obrigatórios."); return;
    }
    setSaving(true);
    let finalVideoUrl = existingVideoUrl;

    try {
      if (videoFile) {
        setUploadingVideo(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `noticias/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('videos').upload(filePath, videoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
        finalVideoUrl = publicUrl;
        setUploadingVideo(false);
      }

      const cleanSlug = slug.trim().replace(/^https?:\/\//, '').split('/').filter(Boolean).pop() || slug;

      const payload = {
        titulo, 
        subtitulo, 
        conteudo, 
        categoria, 
        slug: cleanSlug, 
        imagem_capa: imagemUrl, 
        video_url: finalVideoUrl,
        titulo_config: tituloConfig, 
        subtitulo_config: subtituloConfig,
        seo_tags: seoTags,
        mostrar_na_home_recentes: true
      };

      if (editId) {
        const { error } = await supabase.from("noticias").update(payload).eq("id", editId);
        if (error) throw error;
        alert("✅ Matéria atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("noticias").insert([{ ...payload, ordem_prioridade: 0 }]);
        if (error) throw error;
        alert("🚀 Notícia publicada com sucesso!");
        localStorage.removeItem("news_draft");
        resetForm();
      }
      
      onSuccess?.();
    } catch (err: any) {
       alert("Erro ao processar: " + err.message);
    } finally {
      setSaving(false); setUploadingVideo(false);
    }
  };

  const resetForm = () => {
    setTitulo(""); setSubtitulo(""); setConteudo(""); setCategoria(""); setSlug("");
    setImagemUrl(""); setSeoTags(""); setVideoFile(null); setTituloConfig(DEFAULT_CONFIG);
    setSubtituloConfig(SUBTITLE_DEFAULT);
  };

  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aguardando Auditoria do Banco...</p>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-3 gap-8">
      {/* CORPO DO EDITOR */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 sm:p-8 relative">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
            <h3 className="font-black text-zinc-800 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" /> 
              {editId ? "Modo de Edição Enterprise" : "Redação: Nova Matéria Principal"}
            </h3>
            {!editId && lastSaved && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Save size={10} /> Rascunho salvo às {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
          </div>
          
          <div className="space-y-8">
            {/* TITULO */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Título da Matéria</label>
                  <span className="text-[10px] text-zinc-400 font-bold">{titulo.length} caracteres</span>
                </div>
                <div className="flex gap-2">
                  <select value={tituloConfig.font} onChange={e => setTituloConfig({...tituloConfig, font: e.target.value})} className="text-[10px] bg-zinc-50 border border-zinc-200 rounded p-1 font-bold outline-none text-zinc-700">
                      <option value="var(--font-inter)">Inter (Sans)</option>
                      <option value="var(--font-anton)">Anton (Slab)</option>
                      <option value="var(--font-playfair)">Playfair (Serif)</option>
                  </select>
                  <select value={tituloConfig.color} onChange={e => setTituloConfig({...tituloConfig, color: e.target.value})} className="text-[10px] bg-zinc-50 border border-zinc-200 rounded p-1 font-bold outline-none text-zinc-700">
                      <option value="default">Grafite</option>
                      <option value="destaque">Azul Portal</option>
                      <option value="urgente">Vermelho Urgente</option>
                  </select>
                </div>
              </div>
              <input 
                type="text" 
                value={titulo} 
                onChange={e => {
                  setTitulo(e.target.value);
                  if(!editId) generateSlug(e.target.value);
                }} 
                placeholder="Insira o Título Principal..." 
                style={{ fontFamily: tituloConfig.font, color: tituloConfig.color === 'destaque' ? '#2563eb' : (tituloConfig.color === 'urgente' ? '#dc2626' : '#18181b') }} 
                className="w-full bg-white border border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-3.5 text-2xl md:text-3xl font-black shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-zinc-300" 
              />
            </div>

            {/* SUBTITULO */}
            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Linha Fina / Subtítulo</label>
              <input type="text" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} placeholder="Contextualização rápida..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-3 text-sm font-medium shadow-sm outline-none transition-all text-zinc-700" />
            </div>

            {/* CONTEUDO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Corpo da Matéria</label>
                <div className="flex gap-2">
                   <button onClick={() => setConteudo("")} className="text-[10px] font-bold text-red-500 uppercase">Limpar Tudo</button>
                </div>
              </div>
              <RichTextEditor content={conteudo} onChange={setConteudo} />
            </div>
            
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 border-dashed">
              <p className="text-xs font-bold text-zinc-500 mb-2">Bloco de Mídia Extra (WIP: Galeria de Fotos)</p>
              <button className="text-sm font-bold text-zinc-400 border border-zinc-200 bg-white px-4 py-2 rounded-lg cursor-not-allowed opacity-50">
                + Adicionar Álbum de Fotos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LATERAL DE PUBLICAÇÃO */}
      <aside className="space-y-6">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
          <div className="bg-zinc-50 px-5 py-4 border-b border-zinc-200">
            <h4 className="font-black text-zinc-800 text-sm">Painel de Orquestração</h4>
          </div>
          
          <div className="p-5 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
            {/* CAPA */}
            <div>
              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Capa Principal</label>
              <div className="w-full h-40 bg-zinc-100 rounded-xl border border-zinc-200 mb-3 overflow-hidden relative group">
                {imagemUrl ? (
                  <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300"><Palette size={24}/></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-[10px] font-bold uppercase">Mudar URL</span>
                </div>
              </div>
              <input type="text" value={imagemUrl} onChange={e => setImagemUrl(e.target.value)} placeholder="URL da Foto Imagem..." className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 shadow-sm" />
            </div>
            
            {/* VIDEO */}
            <div>
              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Vídeo Relacionado (Opcional)</label>
              {existingVideoUrl && !videoFile && (
                <p className="text-[10px] text-zinc-400 mb-2 truncate">Ativo: {existingVideoUrl}</p>
              )}
              <div className="border border-dashed border-zinc-300 bg-zinc-50 rounded-xl p-3 text-center cursor-pointer hover:bg-zinc-100 transition-colors relative">
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {videoFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-600 truncate">{videoFile.name}</p>
                    <p className="text-[9px] text-zinc-400 font-bold">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    {videoFile.size > 1024 * 1024 * 5 && <p className="text-[9px] text-orange-500 font-black">Pesado!</p>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1">
                    <MousePointer2 size={14} className="text-zinc-400"/>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Alterar Vídeo</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* CATEGORIA */}
            <div>
              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Linha Editorial</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full text-sm font-bold px-3 py-2.5 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 shadow-sm cursor-pointer bg-white">
                  <option value="">Geral</option>
                  <option value="Arapongas">Arapongas</option>
                  <option value="Esportes">Esportes</option>
                  <option value="Polícia">Polícia</option>
                  <option value="Política">Política</option>
              </select>
            </div>

            {/* SLUG */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest leading-none">URL Slug (SEO)</label>
                <div className="bg-zinc-100 p-1 rounded"><Hash size={10} className="text-zinc-400" /></div>
              </div>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="link-da-noticia" className="w-full text-sm font-mono text-zinc-600 px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 bg-zinc-50" />
            </div>

            {/* SEO TAGS */}
            <div>
              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tags / Keywords (Vírgulas)</label>
              <textarea 
                value={seoTags} 
                onChange={e => setSeoTags(e.target.value)} 
                rows={2}
                placeholder="Ex: arapongas, acidente, urgência..." 
                className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 shadow-sm resize-none"
              />
            </div>
          </div>

          <div className="p-5 border-t border-zinc-100 bg-zinc-50">
            <button 
              onClick={handlePublish} 
              disabled={saving || uploadingVideo} 
              className={`w-full ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-900 hover:bg-zinc-800'} disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3`}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : (editId ? <Save size={16} /> : <Send size={16} />)}
              {saving ? "Salvando..." : (editId ? "Gravar Alterações" : "Lançar Publicação")}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
