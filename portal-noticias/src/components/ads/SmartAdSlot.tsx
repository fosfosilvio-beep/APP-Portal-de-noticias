"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartAdSlotProps {
  slotName: string;
  className?: string;
}

interface BannerData {
  banner_id: string;
  nome_banner: string;
  tipo: string;
  url_imagem: string;
  url_destino: string;
  codigo_html: string;
  slot_id: string;
}

export default function SmartAdSlot({ slotName, className = "" }: SmartAdSlotProps) {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  // 1. Intersection Observer para Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Carrega 200px antes de entrar na tela
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 2. Fetch do Banner (apenas quando estiver visível)
  useEffect(() => {
    if (!isVisible) return;

    async function fetchBanner() {
      try {
        const supabase = createClient();
        
        // Chamar a função RPC que criamos no SQL
        const { data, error } = await supabase
          .rpc("buscar_banner_ativo", { slot_slug_input: slotName });

        if (error || !data || data.length === 0) {
          setBanner(null);
        } else {
          setBanner(data[0]);
        }
      } catch (err) {
        console.error(`[SmartAdSlot] Erro ao buscar banner para ${slotName}:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchBanner();
  }, [isVisible, slotName]);

  // 3. Registro de Impressão (quando o banner realmente carrega e aparece)
  useEffect(() => {
    if (banner && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      
      const supabase = createClient();
      supabase.rpc("registrar_impressao", { 
        banner_uuid: banner.banner_id, 
        slot_uuid: banner.slot_id 
      }).catch(() => null); // Silencioso
    }
  }, [banner]);

  if (!isVisible) return <div ref={containerRef} className={`min-h-[10px] ${className}`} />;

  if (loading) {
    return (
      <div className={`w-full flex items-center justify-center ${className}`}>
        <Skeleton className="w-full h-24 rounded-lg bg-zinc-100" />
      </div>
    );
  }

  if (!banner) return null; // Fallback invisível

  return (
    <div className={`relative overflow-hidden group transition-all duration-300 ${className}`}>
      {banner.tipo === "imagem" ? (
        <a 
          href={`/api/click/${banner.banner_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img 
            src={banner.url_imagem} 
            alt={banner.nome_banner}
            className="w-full h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </a>
      ) : (
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: banner.codigo_html }} 
        />
      )}
    </div>
  );
}
