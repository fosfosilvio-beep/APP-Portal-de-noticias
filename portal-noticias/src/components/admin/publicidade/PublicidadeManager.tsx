"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Megaphone, Plus, Image as ImageIcon, MousePointerClick, Eye, Trash2, Power, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface Banner {
  id: string;
  titulo: string;
  imagem_url: string;
  link_destino: string;
  posicao: string;
  dimensoes: string;
  status: boolean;
  cliques: number;
  visualizacoes: number;
}

export default function PublicidadeManager() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    titulo: "",
    link_destino: "",
    posicao: "home_topo",
    dimensoes: "728x90",
    imagem_url: ""
  });

  const positionDimensions: Record<string, string> = {
    'home_topo': '728x90',
    'home_meio': '728x90',
    'noticia_lateral': '300x250',
    'noticia_meio': '728x90'
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from("publicidade_banners").select("*").order("created_at", { ascending: false });
    if (data) setBanners(data);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Criar preview local
      const objectUrl = URL.createObjectURL(selectedFile);
      setFormData({ ...formData, imagem_url: objectUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imagem_url;

      // === ETAPA A: UPLOAD (Se houver arquivo e não for URL externa) ===
      if (!useExternalUrl && file) {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('midia')
          .upload(fileName, file);

        if (uploadError) throw new Error(`Erro no Storage: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('midia')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrlData.publicUrl;
        setUploading(false);
      }

      if (!finalImageUrl || finalImageUrl.startsWith('blob:')) {
        throw new Error("A imagem é obrigatória. Aguarde o upload ou insira uma URL.");
      }

      // === ETAPA B: INSERÇÃO NO BANCO (Payload 100% Limpo) ===
      const payload = {
        titulo: formData.titulo,
        imagem_url: finalImageUrl,
        link_destino: formData.link_destino || '',
        posicao: formData.posicao,
        dimensoes: formData.dimensoes
      };

      console.log("ENVIANDO PAYLOAD:", payload);

      const { error: dbError } = await (supabase as any)
        .from('publicidade_banners')
        .insert([payload]);

      if (dbError) {
        console.error("DETALHES DO ERRO DB:", dbError);
        throw new Error(`Erro no DB: ${dbError.message}`);
      }

      toast.success("Banner cadastrado com sucesso!");
      setIsModalOpen(false);
      setFormData({ titulo: "", link_destino: "", posicao: "home_topo", dimensoes: "728x90", imagem_url: "" });
      setFile(null);
      fetchBanners();

    } catch (error: any) {
      console.error("ERRO COMPLETO:", error);
      toast.error(error.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("publicidade_banners").update({ status: !currentStatus }).eq("id", id);
    if (!error) fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Deletar banner permanentemente?")) return;
    const { error } = await supabase.from("publicidade_banners").delete().eq("id", id);
    if (!error) fetchBanners();
  };

  const ativos = banners.filter(b => b.status).length;
  const cliquesTotal = banners.reduce((acc: number, b: any) => acc + (b.cliques || 0), 0);

  return (
    <div className="space-y-8 max-w-[1400px] p-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
            <Megaphone size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Ad <span className="text-amber-600">Manager</span></h1>
            <p className="text-slate-500 font-medium mt-1">Gestão de espaços publicitários e monetização.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Novo Banner
        </button>
      </div>

      {/* DASHBOARD RÁPIDO & WIREFRAME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Eye size={24} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Banners Ativos</h4>
              <span className="text-3xl font-black text-slate-900">{ativos}</span>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <MousePointerClick size={24} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cliques (Total)</h4>
              <span className="text-3xl font-black text-slate-900">{cliquesTotal}</span>
            </div>
          </div>
        </div>

        {/* WIREFRAME VISUAL */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Mapa de Anúncios (Wireframe)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* WIREFRAME: HOME */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100 relative">
              <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full absolute -top-3">Layout: Home</span>
              
              <div className="w-full max-w-[200px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mt-4 overflow-hidden">
                {/* Header Falso */}
                <div className="h-6 w-full bg-slate-800 flex items-center px-2">
                  <div className="w-4 h-2 bg-slate-600 rounded-sm"></div>
                </div>
                
                {/* Ad: Home Topo */}
                <div className="p-2 w-full">
                  <div className={`h-8 w-full rounded border-2 border-dashed flex items-center justify-center transition-colors ${formData.posicao === 'home_topo' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
                    <span className="text-[8px] font-black uppercase">Home Topo</span>
                  </div>
                </div>
                
                {/* Conteúdo da Home */}
                <div className="px-2 pb-2 flex gap-2">
                  <div className="w-2/3 space-y-2">
                    <div className="h-12 w-full bg-slate-200 rounded"></div>
                    <div className="h-8 w-full bg-slate-100 rounded"></div>
                    <div className="h-8 w-full bg-slate-100 rounded"></div>
                  </div>
                  <div className="w-1/3 space-y-2">
                    <div className="h-16 w-full bg-slate-200 rounded"></div>
                  </div>
                </div>

                {/* Ad: Home Meio */}
                <div className="px-2 pb-2 w-full">
                  <div className={`h-8 w-full rounded border-2 border-dashed flex items-center justify-center transition-colors ${formData.posicao === 'home_meio' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
                    <span className="text-[8px] font-black uppercase">Home Meio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WIREFRAME: NOTÍCIA */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100 relative">
              <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full absolute -top-3">Layout: Notícia Interna</span>
              
              <div className="w-full max-w-[200px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mt-4 overflow-hidden">
                <div className="h-6 w-full bg-slate-800 flex items-center px-2">
                  <div className="w-4 h-2 bg-slate-600 rounded-sm"></div>
                </div>
                
                <div className="p-2 w-full flex gap-2">
                  <div className="w-2/3 space-y-2">
                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                    <div className="h-12 w-full bg-slate-100 rounded"></div>
                    
                    {/* Ad: Notícia Meio */}
                    <div className={`h-8 w-full rounded border-2 border-dashed flex items-center justify-center transition-colors ${formData.posicao === 'noticia_meio' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
                      <span className="text-[8px] font-black uppercase text-center leading-tight">Meio do Texto</span>
                    </div>

                    <div className="h-8 w-full bg-slate-100 rounded"></div>
                  </div>
                  
                  <div className="w-1/3 space-y-2">
                    {/* Ad: Notícia Lateral */}
                    <div className={`h-16 w-full rounded border-2 border-dashed flex flex-col items-center justify-center transition-colors ${formData.posicao === 'noticia_lateral' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
                      <span className="text-[8px] font-black uppercase text-center leading-tight">Notícia<br/>Lateral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
            {isModalOpen ? "O painel destaca a área do banner que você está criando." : "Clique em 'Novo Banner' para ver as áreas de destaque."}
          </p>
        </div>
      </div>

      {/* GRID DE BANNERS */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden p-8">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Campanhas e Banners</h3>
        
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
            <Megaphone className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">Nenhum banner cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className="border border-slate-100 rounded-3xl overflow-hidden group bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="bg-slate-50 h-32 relative overflow-hidden flex items-center justify-center">
                  <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-100">
                    {banner.posicao.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 mb-4 truncate">{banner.titulo}</h4>
                  
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-6">
                    <span className="flex items-center gap-1"><MousePointerClick size={14}/> {banner.cliques} cliques</span>
                    <span className="flex items-center gap-1"><Eye size={14}/> {banner.visualizacoes} views</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => toggleStatus(banner.id, banner.status)}
                      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${banner.status ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Power size={12} /> {banner.status ? 'Ativo' : 'Inativo'}
                    </button>
                    <button onClick={() => deleteBanner(banner.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL NOVO BANNER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 italic">Novo <span className="text-amber-600">Banner</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-2">X</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título da Campanha</label>
                <input required type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" placeholder="Ex: Black Friday Imóveis" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Posição</label>
                  <select 
                    value={formData.posicao} 
                    onChange={e => {
                      const pos = e.target.value;
                      setFormData({...formData, posicao: pos, dimensoes: positionDimensions[pos]});
                    }} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="home_topo">Home - Topo</option>
                    <option value="home_meio">Home - Meio</option>
                    <option value="noticia_lateral">Notícia - Lateral</option>
                    <option value="noticia_meio">Notícia - Meio do Texto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tamanho Ideal</label>
                  <input readOnly value={formData.dimensoes} className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-500 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link de Destino</label>
                <input type="url" value={formData.link_destino} onChange={e => setFormData({...formData, link_destino: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="https://" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Arte / Imagem</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      type="button" 
                      onClick={() => setUseExternalUrl(false)} 
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${!useExternalUrl ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Upload
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUseExternalUrl(true)} 
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${useExternalUrl ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      URL Externa
                    </button>
                  </div>
                </div>

                {useExternalUrl ? (
                  <div className="space-y-2">
                    <input 
                      type="url" 
                      value={formData.imagem_url} 
                      onChange={e => setFormData({...formData, imagem_url: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20" 
                      placeholder="https://exemplo.com/imagem.png" 
                    />
                    {formData.imagem_url && (
                      <div className="relative w-full flex flex-col items-center p-4 border border-slate-100 rounded-2xl bg-slate-50">
                        <img src={formData.imagem_url} alt="Preview" className="max-h-32 object-contain rounded-lg" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Erro+no+Link')} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                    {formData.imagem_url ? (
                      <div className="relative w-full flex flex-col items-center">
                        <img src={formData.imagem_url} alt="Preview" className="max-h-32 object-contain rounded-lg" />
                        <button type="button" onClick={() => setFormData({...formData, imagem_url: ''})} className="mt-2 text-[10px] font-black text-rose-500 uppercase">Remover Imagem</button>
                      </div>
                    ) : uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-amber-500 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Subindo imagem...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-300 mb-2" size={32} />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Escolha a imagem" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Clique para selecionar</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                <button type="submit" disabled={uploading || !formData.imagem_url} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-amber-200 transition-all active:scale-95">
                  Cadastrar Anúncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
