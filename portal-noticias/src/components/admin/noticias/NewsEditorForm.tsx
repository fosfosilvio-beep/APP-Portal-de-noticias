"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, type NewsFormData } from "@/lib/schemas/news";
import { createClient } from "@/lib/supabase-browser";
import { Role } from "@/lib/auth/roles";
import { toast } from "@/lib/toast";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { 
  Send, Loader2, Save, FileText, Palette,
  Type as TypeIcon, Hash, MousePointer2, Images, X, Upload, Megaphone, CalendarClock, MessageCircle
} from "lucide-react";
import AiCopilot from "./AiCopilot";
import { ScheduleDialog } from "../ScheduleDialog";

const RichTextEditor = dynamic(() => import("../../RichTextEditor"), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center border border-slate-800">
      <div className="text-slate-500 font-medium uppercase tracking-widest text-xs">Preparando Editor...</div>
    </div>
  )
});

interface NewsEditorFormProps {
  editId?: string;
}

export default function NewsEditorForm({ editId }: NewsEditorFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);
  const [adSlots, setAdSlots] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [colunistas, setColunistas] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [sendToWhatsapp, setSendToWhatsapp] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (data) setRole(data.role as Role);
    };
    fetchRole();
  }, []);

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      titulo: "",
      subtitulo: "",
      conteudo: "",
      categoria_id: "",
      slug: "",
      imagem_capa: "",
      video_url: "",
      status: "published",
      mostrar_na_home_recentes: true,
      is_sponsored: false,
      ordem_prioridade: 0,
      seo_tags: "",
      galeria_urls: [],
      ad_id: "",
      colunista_id: "",
      titulo_config: { font: "var(--font-inter)", weight: "900", color: "default" },
      subtitulo_config: { font: "var(--font-inter)", weight: "400", color: "default" }
    }
  });

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = form;
  const conteudo = watch("conteudo");
  const titulo = watch("titulo");
  const subtitulo = watch("subtitulo");
  const tituloConfig = watch("titulo_config");
  const imagemCapa = watch("imagem_capa");
  const galeriaUrls = watch("galeria_urls") || [];

  useEffect(() => {
    fetchMetadata();
    if (editId) {
      loadNewsData();
    } else {
      loadDraft();
    }
  }, [editId]);

  // Auto-save Rascunho (DB + LocalStorage)
  useEffect(() => {
    if (editId || loading) return;
    const interval = setInterval(async () => {
      const data = getValues();
      if (!data.titulo) return;
      
      // 1. Salva no LocalStorage para máxima velocidade/offline
      localStorage.setItem("news_draft_local", JSON.stringify({
        data,
        updated_at: new Date().toISOString()
      }));

      // 2. Salva no Banco (Redundância cross-device)
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("news_drafts").upsert({
          user_id: userData.user.id,
          data: data,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      }
      
      setLastSaved(new Date());
    }, 40000); // 40 segundos
    return () => clearInterval(interval);
  }, [editId, loading]);

  const fetchMetadata = async () => {
    const [adsRes, catRes, colRes] = await Promise.all([
      supabase.from("ad_slots").select("id, nome_slot, posicao_html").eq("status_ativo", true),
      supabase.from("categorias").select("id, nome").eq("ativa", true).order("ordem"),
      supabase.from("colunistas").select("id, nome").order("nome")
    ]);
    if (adsRes.data) setAdSlots(adsRes.data);
    if (colRes.data) setColunistas(colRes.data);
    if (catRes.data) {
      const defaultCats = [
        { id: "geral", nome: "Geral" },
        { id: "entretenimento", nome: "Entretenimento" },
        { id: "educacao", nome: "Educação" },
        { id: "saude", nome: "Saúde" },
        { id: "esportes", nome: "Esportes" }
      ];
      
      const merged = [...catRes.data];
      defaultCats.forEach(d => {
        if (!merged.find(m => m.nome.toLowerCase() === d.nome.toLowerCase())) {
          merged.push(d);
        }
      });
      setCategorias(merged);
    }
  };

  const loadNewsData = async () => {
    try {
      const { data, error } = await supabase.from("noticias").select("*").eq("id", editId).single();
      if (error) throw error;
      console.log("Notícia carregada com sucesso:", data.titulo);
      form.reset({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || "",
        categoria_id: data.categoria_id || "",
        slug: data.slug || "",
        imagem_capa: data.imagem_capa || "",
        video_url: data.video_url || "",
        status: data.status || "published",
        mostrar_na_home_recentes: data.mostrar_na_home_recentes ?? true,
        is_sponsored: data.is_sponsored ?? false,
        ordem_prioridade: data.ordem_prioridade || 0,
        seo_tags: data.seo_tags || "",
        galeria_urls: data.galeria_urls || [],
        ad_id: data.ad_id || "",
        colunista_id: data.colunista_id || "",
        titulo_config: data.titulo_config || { font: "var(--font-inter)", weight: "900", color: "default" },
        subtitulo_config: data.subtitulo_config || { font: "var(--font-inter)", weight: "400", color: "default" }
      });
    } catch (err: any) {
      console.error("Erro ao carregar notícia:", err);
      toast.error("Erro ao carregar", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    let localDraft: any = null;
    try {
      const localStr = localStorage.getItem("news_draft_local");
      if (localStr) localDraft = JSON.parse(localStr);
    } catch (e) {
      console.error("Erro ao ler rascunho local", e);
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user && localDraft) {
      // Se não estiver logado, usa apenas o local
      form.reset(localDraft.data as any);
      setLastSaved(new Date(localDraft.updated_at));
      return;
    }

    const { data } = await supabase.from("news_drafts").select("data, updated_at").eq("user_id", userData?.user?.id || "").single();
    
    let dbDate = data ? new Date(data.updated_at).getTime() : 0;
    let localDate = localDraft ? new Date(localDraft.updated_at).getTime() : 0;

    // Prioriza o mais recente
    if (localDraft && localDate >= dbDate) {
      form.reset(localDraft.data as any);
      setLastSaved(new Date(localDraft.updated_at));
    } else if (data && data.data) {
      form.reset(data.data as any);
      setLastSaved(new Date(data.updated_at));
    }
  };

  /**
   * Gera um slug base a partir do texto e garante unicidade
   * consultando o banco via RPC `slug_disponivel`.
   * Se o slug já existir, adiciona sufixo -2, -3... até encontrar um livre.
   */
  const generateSlug = async (text: string, excluirId?: string): Promise<string> => {
    // Regex robusto: remove acentos, aspas, dois-pontos, pontos e qualquer
    // caractere não-alfanumérico gerado por títulos de IA.
    const base = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")  // remove acentos diacríticos
      .replace(/["'`:.,!?@#$%^&*()+=<>{}[\]|\\\//]/g, "") // caracteres especiais
      .replace(/[^\w\s-]/g, "")           // qualquer outro caractere não-word
      .replace(/\s+/g, "-")              // espaços → hífens
      .replace(/-{2,}/g, "-")            // hífens duplicados
      .replace(/^-|-$/g, "");            // hífens nas extremidades

    let candidate = base;
    let attempt = 1;

    // Verifica unicidade via RPC; em caso de falha de rede, usa o base
    try {
      while (true) {
        const { data: disponivel } = await supabase.rpc("slug_disponivel", {
          p_slug: candidate,
          p_excluir_id: excluirId || null,
        });
        if (disponivel !== false) break; // null (erro) ou true → aceita
        attempt++;
        candidate = `${base}-${attempt}`;
      }
    } catch (e) {
      console.warn("[generateSlug] Falha na verificação de colisão:", e);
    }

    setValue("slug", candidate, { shouldValidate: true });
    return candidate;
  };

  const handleGaleriaUpload = async (files: FileList) => {
    toast.promise(
      (async () => {
        const newUrls = [...galeriaUrls];
        for (const file of Array.from(files)) {
          const ext = file.name.split(".").pop();
          const path = `${"galeria"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from("media").upload(path, file);
          if (!error) {
            const { data } = supabase.storage.from("media").getPublicUrl(path);
            newUrls.push(data.publicUrl);
          }
        }
        setValue("galeria_urls", newUrls);
      })(),
      {
        loading: "Enviando fotos...",
        success: "Fotos adicionadas à galeria",
        error: "Erro no upload",
      }
    );
  };

  const removeGaleriaItem = (index: number) => {
    const newUrls = [...galeriaUrls];
    newUrls.splice(index, 1);
    setValue("galeria_urls", newUrls);
  };

  const onSubmit = async (data: NewsFormData) => {
    setIsSaving(true);
    try {
      // Busca o objeto da categoria para pegar o nome correto
      const selectedCat = categorias.find(c => c.id === data.categoria_id);
      
      console.log("Submetendo matéria:", {
        id_selecionado: data.categoria_id,
        categoria_encontrada: selectedCat?.nome
      });

      const payload = {
        ...data,
        slug: data.slug.trim().replace(/^https?:\/\//, "").split("/").filter(Boolean).pop() || data.slug,
        ad_id: data.ad_id || null,
        colunista_id: data.colunista_id || null,
        categoria_id: data.categoria_id || null,
        // Garante que o nome da categoria seja salvo no campo legado
        categoria: selectedCat ? selectedCat.nome : "Geral",
        status: data.status || "draft",
        publish_at: data.publish_at || null,
      };

      if (editId) {
        const { error } = await supabase.from("noticias").update(payload).eq("id", editId);
        if (error) throw error;
        toast.success("Matéria atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("noticias").insert([payload]);
        if (error) throw error;
        toast.success("Notícia publicada com sucesso!");
        
        // Limpa rascunho (localStorage + banco)
        localStorage.removeItem("news_draft_local");
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from("news_drafts").delete().eq("user_id", userData.user.id);
        }

        if (sendToWhatsapp) {
          const portalUrl = typeof window !== "undefined" ? window.location.origin : "https://nossawebtv.com.br";
          const link = `${portalUrl}/noticia/${payload.slug}`;
          const text = `🚨 *NOVA MATÉRIA* 🚨\n\n*${payload.titulo}*\n\nLeia agora:\n${link}`;
          const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
          window.open(waUrl, "_blank");
        }
        
        router.push("/admin/noticias");
      }
    } catch (err: any) {
      toast.error("Erro ao publicar", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando Matéria...</p>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-3 gap-8">
      {/* CORPO DO EDITOR */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 relative">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <h3 className="font-black text-white flex items-center gap-2 text-lg">
              <FileText size={20} className="text-blue-500" />
              {editId ? "Modo de Edição" : "Nova Matéria"}
            </h3>
            {!editId && lastSaved && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Save size={10} /> Rascunho na nuvem salvo às {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <form id="news-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* TITULO */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título da Matéria</label>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={tituloConfig.font} 
                    onChange={(e) => setValue("titulo_config.font", e.target.value)} 
                    className="text-[10px] bg-slate-950 border border-slate-800 rounded p-1 font-bold outline-none text-slate-300"
                  >
                    <option value="var(--font-inter)">Inter</option>
                    <option value="var(--font-anton)">Anton</option>
                    <option value="var(--font-playfair)">Playfair</option>
                  </select>
                  <select 
                    value={tituloConfig.color} 
                    onChange={(e) => setValue("titulo_config.color", e.target.value)} 
                    className="text-[10px] bg-slate-950 border border-slate-800 rounded p-1 font-bold outline-none text-slate-300"
                  >
                    <option value="default">Grafite</option>
                    <option value="destaque">Azul Portal</option>
                    <option value="urgente">Vermelho Urgente</option>
                  </select>
                </div>
              </div>
              <input
                type="text"
                {...register("titulo", {
                  onChange: (e) => {
                    if (!editId) generateSlug(e.target.value, undefined);
                  }
                })}
                value={titulo}
                placeholder="Insira o Título Principal..."
                style={{
                  fontFamily: tituloConfig.font,
                  color: tituloConfig.color === "destaque" ? "#3b82f6" : (tituloConfig.color === "urgente" ? "#ef4444" : "#f8fafc"),
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent rounded-xl px-4 py-3.5 text-2xl md:text-3xl font-black shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-600"
              />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
            </div>

            {/* SUBTITULO */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Subtítulo / Linha Fina</label>
              <input
                type="text"
                {...register("subtitulo")}
                value={subtitulo}
                placeholder="Contextualização rápida..."
                className="w-full bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none transition-all text-white placeholder:text-slate-600"
              />
            </div>

            {/* CONTEUDO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Corpo da Matéria</label>
                <button type="button" onClick={() => setValue("conteudo", "")} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Limpar</button>
              </div>
              <RichTextEditor content={conteudo} onChange={(c) => setValue("conteudo", c, { shouldValidate: true })} />
              {errors.conteudo && <p className="text-red-500 text-xs mt-1">{errors.conteudo.message}</p>}
            </div>

            {/* GALERIA */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Images size={16} className="text-blue-500" />
                  <h4 className="font-black text-slate-200 text-sm">Álbum de Fotos</h4>
                </div>
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors shadow-sm">
                  <Upload size={14} /> Upload em Lote
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files) handleGaleriaUpload(e.target.files); }}
                  />
                </label>
              </div>

              {galeriaUrls.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galeriaUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-800 shadow-sm bg-black">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGaleriaItem(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 rounded-xl py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Images size={28} className="opacity-40" />
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhuma foto no álbum ainda</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* LATERAL DIREITA: IA & CONFIGS */}
      <aside className="space-y-6">
        
        {/* IA Copilot */}
        <AiCopilot onGenerated={(data) => {
          setValue("titulo", data.titulo, { shouldValidate: true, shouldDirty: true });
          if (!editId) generateSlug(data.titulo, undefined);
          if (data.subtitulo) setValue("subtitulo", data.subtitulo, { shouldValidate: true, shouldDirty: true });
          if (data.conteudo) setValue("conteudo", data.conteudo, { shouldValidate: true, shouldDirty: true });
        }} />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Seletor de Ad */}
          <div className="px-5 py-4 bg-amber-950/20 border-b border-amber-900/30 flex items-center gap-3">
            <Megaphone size={16} className="text-amber-500" />
            <div className="flex-1">
              <label className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest block mb-1">Anúncio Vinculado</label>
              <select
                {...register("ad_id")}
                className="w-full text-xs font-bold px-2 py-1.5 border border-amber-900/50 rounded-lg bg-amber-950/50 text-amber-100 outline-none focus:border-amber-500"
              >
                <option value="">— Nenhum —</option>
                {adSlots.map((ad) => (
                  <option key={ad.id} value={ad.id}>{ad.nome_slot} ({ad.posicao_html})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* CAPA */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Capa Principal</label>
              <div className="w-full h-40 bg-slate-950 rounded-xl border border-slate-800 mb-3 overflow-hidden relative group">
                {imagemCapa ? (
                  <img src={imagemCapa} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <Palette size={24} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Sem Capa</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                  <Upload size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const ext = file.name.split(".").pop();
                      const path = `capas/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                      const { error } = await supabase.storage.from("media").upload(path, file);
                      if (!error) {
                        const { data } = supabase.storage.from("media").getPublicUrl(path);
                        setValue("imagem_capa", data.publicUrl, { shouldValidate: true });
                      }
                    }
                  }} />
                </label>
              </div>
              <input
                type="text"
                {...register("imagem_capa")}
                placeholder="Ou cole a URL..."
                className="w-full text-xs font-bold px-3 py-2 border border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-slate-950 text-white placeholder:text-slate-600"
              />
            </div>

            {/* VIDEO */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Vídeo Destacado</label>
              <input
                type="url"
                {...register("video_url")}
                placeholder="YouTube ou MP4 link..."
                className="w-full text-xs font-bold px-3 py-2 border border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-slate-950 text-white placeholder:text-slate-600"
              />
            </div>

            {/* STATUS & SCHEDULE */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Status da Matéria</label>
              <div className="flex gap-2">
                <select
                  {...register("status")}
                  className="w-full text-sm font-bold px-3 py-2 border border-slate-800 rounded-lg outline-none focus:border-blue-400 bg-slate-950 text-white"
                >
                  <option value="draft">Rascunho</option>
                  <option value="in_review">Aguardando Revisão</option>
                  {(role === 'admin' || role === 'editor' || !role) && (
                    <>
                      <option value="published">Publicado Agora</option>
                      <option value="scheduled">Agendado</option>
                    </>
                  )}
                  {(role === 'admin' || role === 'editor' || role === 'revisor' || !role) && (
                    <option value="archived">Arquivado</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setScheduleOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700 flex-shrink-0"
                  title="Agendar"
                >
                  <CalendarClock size={20} />
                </button>
              </div>
              {watch("status") === "scheduled" && watch("publish_at") && (
                <p className="text-[10px] mt-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                  Agendado para: {new Date(watch("publish_at")!).toLocaleString()}
                </p>
              )}
            </div>

            {/* CATEGORIA */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Linha Editorial</label>
              <select
                {...register("categoria_id")}
                className="w-full text-sm font-bold px-3 py-2.5 border border-slate-800 rounded-lg outline-none focus:border-blue-400 bg-slate-950 text-white"
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            
            {/* COLUNISTA */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Autor / Colunista</label>
              <select
                {...register("colunista_id")}
                className="w-full text-sm font-bold px-3 py-2.5 border border-slate-800 rounded-lg outline-none focus:border-blue-400 bg-slate-950 text-white"
              >
                <option value="">Redação (Padrão)</option>
                {colunistas.map(col => (
                  <option key={col.id} value={col.id}>{col.nome}</option>
                ))}
              </select>
            </div>

            {/* SLUG */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">URL Slug (SEO)</label>
              <input
                type="text"
                {...register("slug")}
                placeholder="link-da-noticia"
                className="w-full text-sm font-mono text-white font-bold px-3 py-2 border border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-600 bg-slate-950 placeholder:text-slate-600"
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>

            {/* SEO TAGS */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Tags / Keywords</label>
              <textarea
                {...register("seo_tags")}
                rows={2}
                placeholder="Ex: politica, economia..."
                className="w-full text-xs font-medium px-3 py-2 border border-slate-800 rounded-lg outline-none focus:border-blue-400 bg-slate-950 resize-none text-white placeholder:text-slate-600"
              />
            </div>
            {/* ZAPNEWS TOGGLE */}
            <div className="pt-4 mt-2 border-t border-slate-800">
              <label className="flex items-center gap-3 p-4 bg-emerald-950/30 rounded-xl border border-emerald-900/50 cursor-pointer hover:bg-emerald-900/20 transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={sendToWhatsapp}
                    onChange={e => setSendToWhatsapp(e.target.checked)}
                    className="w-5 h-5 rounded border-emerald-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 peer"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <MessageCircle size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Disparar ZapNews</span>
                </div>
              </label>
            </div>
          </div>

          <div className="p-5 border-t border-slate-800 bg-slate-900">
            <button
              type="submit"
              form="news-form"
              disabled={isSaving}
              className={`w-full ${editId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-500"} disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3`}
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : (editId ? <Save size={16} /> : <Send size={16} />)}
              {isSaving ? "Processando..." : (editId ? "Gravar Alterações" : "Publicar Matéria")}
            </button>
          </div>
        </div>
      </aside>
      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSchedule={(isoDate) => {
          setValue("publish_at", isoDate);
          setValue("status", "scheduled");
        }}
      />
    </div>
  );
}
