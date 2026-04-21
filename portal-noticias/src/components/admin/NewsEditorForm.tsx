"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Send, Loader2, Save, FileText, Palette,
  Type as TypeIcon, Hash, MousePointer2, Images, X, Upload, Megaphone
} from "lucide-react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("../RichTextEditor"), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center border border-zinc-800">
      <div className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Preparando Editor...</div>
    </div>
  )
});

interface StyleConfig {
  font: string;
  weight: string;
  color: string;
}

const DEFAULT_CONFIG: StyleConfig = { font: "var(--font-inter)", weight: "900", color: "default" };
const SUBTITLE_DEFAULT: StyleConfig = { font: "var(--font-inter)", weight: "400", color: "default" };

interface AdSlot { id: string; nome_slot: string; posicao_html: string; status_ativo: boolean; }

interface NewsEditorFormProps {
  editId?: string;
  onSuccess?: () => void;
}

export default function NewsEditorForm({ editId, onSuccess }: NewsEditorFormProps) {
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Campos básicos
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

  // Galeria de Fotos
  const [galeriaUrls, setGaleriaUrls] = useState<string[]>([]);
  const [uploadingGaleria, setUploadingGaleria] = useState(false);

  // Seletor de Ads
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [selectedAdId, setSelectedAdId] = useState("");

  useEffect(() => {
    fetchAdSlots();
    if (editId) {
      loadNewsData();
    } else {
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

  useEffect(() => {
    if (editId) return;
    const interval = setInterval(() => {
      const draft = { titulo, subtitulo, conteudo, categoria, slug, imagemUrl };
      localStorage.setItem("news_draft", JSON.stringify(draft));
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [titulo, subtitulo, conteudo, categoria, slug, imagemUrl, editId]);

  const fetchAdSlots = async () => {
    const { data } = await supabase
      .from("ad_slots")
      .select("id, nome_slot, posicao_html, status_ativo")
      .eq("status_ativo", true);
    if (data) setAdSlots(data as AdSlot[]);
  };

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
        setGaleriaUrls(data.galeria_urls || []);
        setSelectedAdId(data.ad_id || "");
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
    const clean = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    setSlug(clean);
  };

  const handleGaleriaUpload = async (files: FileList) => {
    setUploadingGaleria(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `galeria/${editId || "new"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
        if (error) continue;
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        newUrls.push(publicUrl);
      }
      setGaleriaUrls((prev) => [...prev, ...newUrls]);
    } finally {
      setUploadingGaleria(false);
    }
  };

  const removeGaleriaItem = (url: string) => {
    setGaleriaUrls((prev) => prev.filter((u) => u !== url));
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
        const fileExt = videoFile.name.split(".").pop();
        const fileName = `noticias/${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("videos").upload(fileName, videoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(fileName);
        finalVideoUrl = publicUrl;
        setUploadingVideo(false);
      }

      const cleanSlug = slug.trim().replace(/^https?:\/\//, "").split("/").filter(Boolean).pop() || slug;

      // Sanitização estrita: ad_id precisa ser UUID válido ou null
      const sanitizedAdId = selectedAdId && selectedAdId !== "" && selectedAdId !== "none" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedAdId)
        ? selectedAdId
        : null;

      const payload = {
        titulo, subtitulo, conteudo, categoria,
        slug: cleanSlug,
        imagem_capa: imagemUrl,
        video_url: finalVideoUrl,
        titulo_config: tituloConfig,
        subtitulo_config: subtituloConfig,
        seo_tags: seoTags,
        galeria_urls: galeriaUrls.length > 0 ? galeriaUrls : null,
        ad_id: sanitizedAdId,
        mostrar_na_home_recentes: true,
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
    setImagemUrl(""); setSeoTags(""); setVideoFile(null); setGaleriaUrls([]); setSelectedAdId("");
    setTituloConfig(DEFAULT_CONFIG); setSubtituloConfig(SUBTITLE_DEFAULT);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando Matéria...</p>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-3 gap-8">
      {/* CORPO DO EDITOR */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 relative">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg">
              <FileText size={20} className="text-blue-500" />
              {editId ? "Modo de Edição" : "Nova Matéria"}
            </h3>
            {!editId && lastSaved && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Save size={10} /> Rascunho salvo às {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <div className="space-y-8">
            {/* TITULO */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Título da Matéria</label>
                  <span className="text-[10px] text-slate-400 font-bold">{titulo.length} chars</span>
                </div>
                <div className="flex gap-2">
                  <select value={tituloConfig.font} onChange={(e) => setTituloConfig({ ...tituloConfig, font: e.target.value })} className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 font-bold outline-none text-slate-700">
                    <option value="var(--font-inter)">Inter</option>
                    <option value="var(--font-anton)">Anton</option>
                    <option value="var(--font-playfair)">Playfair</option>
                  </select>
                  <select value={tituloConfig.color} onChange={(e) => setTituloConfig({ ...tituloConfig, color: e.target.value })} className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 font-bold outline-none text-slate-700">
                    <option value="default">Grafite</option>
                    <option value="destaque">Azul Portal</option>
                    <option value="urgente">Vermelho Urgente</option>
                  </select>
                </div>
              </div>
              <input
                type="text"
                value={titulo}
                onChange={(e) => { setTitulo(e.target.value); if (!editId) generateSlug(e.target.value); }}
                placeholder="Insira o Título Principal..."
                style={{
                  fontFamily: tituloConfig.font,
                  color: tituloConfig.color === "destaque" ? "#2563eb" : (tituloConfig.color === "urgente" ? "#dc2626" : "#0f172a"),
                }}
                className="w-full bg-white border border-slate-300 focus:border-blue-400 rounded-xl px-4 py-3.5 text-2xl md:text-3xl font-black shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300"
              />
            </div>

            {/* SUBTITULO */}
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">Subtítulo / Linha Fina</label>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                placeholder="Contextualização rápida..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-400 rounded-xl px-4 py-3 text-sm font-medium shadow-sm outline-none transition-all text-slate-800"
              />
            </div>

            {/* CONTEUDO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Corpo da Matéria</label>
                <button onClick={() => setConteudo("")} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Limpar</button>
              </div>
              <RichTextEditor content={conteudo} onChange={setConteudo} />
            </div>

            {/* GALERIA DE FOTOS */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Images size={16} className="text-blue-500" />
                  <h4 className="font-black text-slate-800 text-sm">Álbum de Fotos da Matéria</h4>
                </div>
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors shadow-sm">
                  {uploadingGaleria ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploadingGaleria ? "Enviando..." : "Upload em Lote"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files) handleGaleriaUpload(e.target.files); }}
                    disabled={uploadingGaleria}
                  />
                </label>
              </div>

              {galeriaUrls.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galeriaUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeGaleriaItem(url)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Images size={28} className="opacity-40" />
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhuma foto no álbum ainda</p>
                  <p className="text-[10px] text-slate-400">Envie várias fotos de uma vez com o botão acima</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LATERAL */}
      <aside className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
          {/* Seletor de Ad — Topo */}
          <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
            <Megaphone size={16} className="text-amber-600" />
            <div className="flex-1">
              <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-1">Anúncio Vinculado</label>
              <select
                value={selectedAdId}
                onChange={(e) => setSelectedAdId(e.target.value)}
                className="w-full text-xs font-bold px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-slate-800 outline-none focus:border-amber-400"
              >
                <option value="">— Nenhum —</option>
                {adSlots.map((ad) => (
                  <option key={ad.id} value={ad.id}>{ad.nome_slot} ({ad.posicao_html})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="font-black text-slate-900 text-sm">Painel de Orquestração</h4>
          </div>

          <div className="p-5 space-y-6 max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-hide">
            {/* CAPA */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Capa Principal</label>
              <div className="w-full h-40 bg-slate-100 rounded-xl border border-slate-200 mb-3 overflow-hidden relative group">
                {imagemUrl ? (
                  <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Palette size={24} /></div>
                )}
              </div>
              <input
                type="text"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="URL da Foto de Capa..."
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-400 shadow-sm text-slate-800"
              />
            </div>

            {/* VIDEO */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Vídeo Relacionado</label>
              {existingVideoUrl && !videoFile && (
                <p className="text-[10px] text-slate-500 mb-2 truncate font-medium">Ativo: {existingVideoUrl}</p>
              )}
              <div className="border border-dashed border-slate-300 bg-slate-50 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-100 transition-colors relative">
                <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {videoFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-600 truncate">{videoFile.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1">
                    <MousePointer2 size={14} className="text-slate-400" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selecionar Vídeo</p>
                  </div>
                )}
              </div>
            </div>

            {/* CATEGORIA */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Linha Editorial</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full text-sm font-bold px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-400 shadow-sm cursor-pointer bg-white text-slate-800"
              >
                <option value="">Geral</option>
                <option value="Arapongas">Arapongas</option>
                <option value="Esportes">Esportes</option>
                <option value="Polícia">Polícia</option>
                <option value="Política">Política</option>
              </select>
            </div>

            {/* SLUG */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">URL Slug (SEO)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="link-da-noticia"
                className="w-full text-sm font-mono text-slate-700 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-slate-500 bg-slate-50"
              />
            </div>

            {/* SEO */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Tags / Keywords</label>
              <textarea
                value={seoTags}
                onChange={(e) => setSeoTags(e.target.value)}
                rows={2}
                placeholder="Ex: arapongas, acidente, urgência..."
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-400 shadow-sm resize-none text-slate-800"
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handlePublish}
              disabled={saving || uploadingVideo}
              className={`w-full ${editId ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"} disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3`}
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
