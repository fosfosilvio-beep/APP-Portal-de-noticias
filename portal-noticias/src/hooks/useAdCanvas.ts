"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";

// ============================================================
// TIPOS
// ============================================================

export interface AdSlot {
  id: string;
  nome_slot: string;
  posicao_html: string;
  zone_id: string | null;
  dimensoes: string;
  codigo_html_ou_imagem: string | null;
  status_ativo: boolean;
  advertiser_name?: string | null;
  cliente_nome?: string | null;
  click_url?: string | null;
  link_destino?: string | null;
  end_date?: string | null;
  validade_ate?: string | null;
  custom_width?: number | null;
  custom_height?: number | null;
  zone_order?: number;
  cliques?: number;
  noticia_id?: string | null;
}

/** Mapa de { zoneId → slotId } — representa o que está alocado no canvas */
export type CanvasAssignments = Record<string, string>;

/** Zonas disponíveis por página */
export interface ZoneDefinition {
  id: string;       // ex: "home__header_top"
  page: "home" | "article";
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  description: string;
}

// ============================================================
// ZONAS CANÔNICAS (Contrato de Layout)
// ============================================================

export const CANVAS_ZONES: ZoneDefinition[] = [
  // HOME
  { id: "home__header_top",        page: "home",    label: "Header — Topo",          defaultWidth: 728,  defaultHeight: 90,  description: "Banner horizontal logo acima do conteúdo" },
  { id: "home__hero_below",        page: "home",    label: "Abaixo do Hero",         defaultWidth: 970,  defaultHeight: 90,  description: "Banner full-width após o carrossel principal" },
  { id: "home__sidebar_1",         page: "home",    label: "Sidebar — Bloco 1",      defaultWidth: 300,  defaultHeight: 250, description: "Retângulo médio, topo da sidebar" },
  { id: "home__sidebar_2",         page: "home",    label: "Sidebar — Bloco 2",      defaultWidth: 300,  defaultHeight: 400, description: "Retângulo grande, meio da sidebar" },
  { id: "home__between_articles",  page: "home",    label: "Entre Artigos",          defaultWidth: 728,  defaultHeight: 90,  description: "Banner horizontal entre os cards de notícias" },
  { id: "home__footer_top",        page: "home",    label: "Rodapé — Topo",          defaultWidth: 728,  defaultHeight: 90,  description: "Banner imediatamente acima do footer" },
  // ARTICLE
  { id: "article__header_top",     page: "article", label: "Header — Topo",          defaultWidth: 728,  defaultHeight: 90,  description: "Banner no topo da página de notícia" },
  { id: "article__in_article_1",   page: "article", label: "In-Article 1",           defaultWidth: 468,  defaultHeight: 60,  description: "Inserido após o 2º parágrafo do corpo" },
  { id: "article__in_article_2",   page: "article", label: "In-Article 2",           defaultWidth: 468,  defaultHeight: 60,  description: "Inserido após o 5º parágrafo do corpo" },
  { id: "article__sidebar_1",      page: "article", label: "Sidebar da Notícia",     defaultWidth: 300,  defaultHeight: 250, description: "Sidebar colada à direita do artigo" },
  { id: "article__footer_top",     page: "article", label: "Rodapé — Topo",          defaultWidth: 728,  defaultHeight: 90,  description: "Banner acima do footer na página de notícia" },
];

// ============================================================
// HOOK
// ============================================================

export function useAdCanvas() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [assignments, setAssignments] = useState<CanvasAssignments>({});
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [previewNoticiaId, setPreviewNoticiaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Slot selecionado derivado
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;

  // ── Carregar dados do Supabase ──────────────────────────────
  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("ad_slots")
      .select("*")
      .order("zone_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Erro", "Falha ao carregar slots de anúncios.");
      setLoading(false);
      return;
    }

    const normalized: AdSlot[] = (data || []).map((s: any) => ({
      ...s,
      cliente_nome: s.advertiser_name || s.cliente_nome,
      link_destino: s.click_url || s.link_destino,
      validade_ate: s.end_date || s.validade_ate,
    }));

    setSlots(normalized);

    // Montar assignments a partir do zone_id salvo
    const initial: CanvasAssignments = {};
    normalized.forEach((s) => {
      // Se não tem previewNoticiaId, só carrega os assignments globais?
      // Ou carregamos todos? O mais simples é carregar todos.
      if (s.zone_id && s.status_ativo) {
        initial[s.zone_id] = s.id;
      }
    });
    setAssignments(initial);

    // Buscar as últimas 20 notícias para o seletor
    const { data: newsData } = await supabase
      .from("noticias")
      .select("id, titulo, slug, thumbnail, imagem_capa")
      .order("created_at", { ascending: false })
      .limit(20);
    if (newsData) setLatestNews(newsData);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // ── Drag-and-Drop: atribuir slot a uma zona ─────────────────
  const assignToZone = useCallback((slotId: string, zoneId: string) => {
    setAssignments((prev) => {
      // Remove o slot de qualquer zona anterior
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([, id]) => id !== slotId)
      );
      return { ...cleaned, [zoneId]: slotId };
    });

    // Atualiza o zone_id local no slot
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, zone_id: zoneId, status_ativo: true }
          : s
      )
    );
  }, []);

  // ── Remover slot de uma zona ────────────────────────────────
  const removeFromZone = useCallback((zoneId: string) => {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  }, []);

  // ── Atualizar propriedade de um slot (local) ────────────────
  const updateSlot = useCallback((id: string, patch: Partial<AdSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  // ── Atualizar dimensões custom ──────────────────────────────
  const updateDimensions = useCallback(
    (id: string, w: number | null, h: number | null) => {
      updateSlot(id, { custom_width: w, custom_height: h });
    },
    [updateSlot]
  );

  // ── Criar novo slot em branco ───────────────────────────────
  const addSlot = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("ad_slots")
      .insert([{
        nome_slot: "Novo Banner",
        posicao_html: "home__header_top",
        dimensoes: "728x90",
        status_ativo: false,
        zone_order: 0,
      }])
      .select()
      .single();
    if (error) { toast.error("Erro", error.message); return; }
    if (data) setSlots((prev) => [...prev, data as AdSlot]);
  }, []);

  // ── Deletar slot ────────────────────────────────────────────
  const deleteSlot = useCallback(async (id: string) => {
    if (!window.confirm("Remover este banner permanentemente?")) return;
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("ad_slots").delete().eq("id", id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (next[k] === id) delete next[k]; });
      return next;
    });
    if (selectedSlotId === id) setSelectedSlotId(null);
  }, [selectedSlotId]);

  // ── Upload de imagem ────────────────────────────────────────
  const uploadImage = useCallback(async (id: string, file: File) => {
    const supabase = createClient();
    if (!supabase) return;
    const ext = file.name.split(".").pop();
    const path = `ads/${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });
    if (error) { toast.error("Erro no upload", error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    updateSlot(id, { codigo_html_ou_imagem: publicUrl });
  }, [updateSlot]);

  // ── Salvar tudo no Supabase ─────────────────────────────────
  const saveAll = useCallback(async () => {
    setSaving(true);
    const supabase = createClient();
    if (!supabase) { setSaving(false); return; }

    try {
      const updates = slots.map((slot) => {
        const zoneId = Object.keys(assignments).find((k) => assignments[k] === slot.id) || slot.zone_id;
        return supabase.from("ad_slots").update({
          nome_slot:              slot.nome_slot,
          posicao_html:           slot.posicao_html,
          zone_id:                zoneId || null,
          dimensoes:              slot.dimensoes,
          codigo_html_ou_imagem:  slot.codigo_html_ou_imagem,
          status_ativo:           slot.status_ativo,
          advertiser_name:        slot.cliente_nome,
          click_url:              slot.link_destino,
          end_date:               slot.validade_ate,
          custom_width:           slot.custom_width ?? null,
          custom_height:          slot.custom_height ?? null,
          zone_order:             slot.zone_order ?? 0,
          noticia_id:             slot.noticia_id ?? null,
        }).eq("id", slot.id);
      });

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        toast.error("Erro parcial", `${errors.length} slot(s) não foram salvos.`);
      } else {
        toast.success("Publicado!", "Todos os banners foram salvos com sucesso.");
        await fetchSlots();
      }
    } catch (err: any) {
      toast.error("Erro crítico", err.message);
    } finally {
      setSaving(false);
    }
  }, [slots, assignments, fetchSlots]);

  return {
    slots,
    assignments,
    selectedSlotId,
    selectedSlot,
    loading,
    saving,
    setSelectedSlotId,
    assignToZone,
    removeFromZone,
    updateSlot,
    updateDimensions,
    addSlot,
    deleteSlot,
    uploadImage,
    saveAll,
    fetchSlots,
    latestNews,
    previewNoticiaId,
    setPreviewNoticiaId,
  };
}
