"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { 
  Plus, 
  Search, 
  ImageIcon, 
  Upload, 
  Trash2, 
  Edit2,
  Loader2,
  ExternalLink,
  Eye,
  Check,
  Layout
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  nome: string;
  campanha_id: string;
  tipo: string;
  url_imagem: string;
  url_destino: string;
  total_views: number;
  total_cliques: number;
  campanhas?: {
    nome: string;
    anunciantes?: {
      nome: string;
    }
  };
  banners_slots?: {
    slot_id: string;
    slots_publicitarios: {
      slug: string;
    }
  }[];
}

interface Campanha {
  id: string;
  nome: string;
  anunciantes?: {
    nome: string;
  }
}

interface Slot {
  id: string;
  nome: string;
  slug: string;
}

export default function BannersClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    campanha_id: "",
    url_destino: "",
    peso: 1,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const supabase = createClient();
      
      // Banners + Joins
      const { data: bData, error: bErr } = await supabase
        .from("banners")
        .select(`
          *,
          campanhas(nome, anunciantes(nome)),
          banners_slots(slot_id, slots_publicitarios(slug))
        `)
        .order("created_at", { ascending: false });

      if (bErr) throw bErr;
      setBanners(bData || []);

      // Campanhas
      const { data: cData } = await supabase
        .from("campanhas")
        .select("id, nome, anunciantes(nome)")
        .eq("status", "ativa");
      setCampanhas(cData || []);

      // Slots
      const { data: sData } = await supabase.from("slots_publicitarios").select("id, nome, slug").order("nome");
      setSlots(sData || []);

    } catch (err) {
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const toggleSlot = (id: string) => {
    setSelectedSlots(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  async function handleSave() {
    if (!formData.nome || !formData.campanha_id || !selectedFile) {
      return toast.error("Preencha o nome, campanha e selecione uma imagem.");
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      
      // 1. Upload da Imagem
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("publicidade")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("publicidade")
        .getPublicUrl(filePath);

      // 2. Inserir Banner
      const { data: newBanner, error: bannerError } = await supabase
        .from("banners")
        .insert([{
          ...formData,
          url_imagem: publicUrl,
          tipo: "imagem"
        }])
        .select()
        .single();

      if (bannerError) throw bannerError;

      // 3. Vincular Slots (Tabela Pivô)
      if (selectedSlots.length > 0) {
        const pivotData = selectedSlots.map(slotId => ({
          banner_id: newBanner.id,
          slot_id: slotId,
          peso: formData.peso,
          ativo: true
        }));

        const { error: pivotError } = await supabase
          .from("banners_slots")
          .insert(pivotData);

        if (pivotError) throw pivotError;
      }

      toast.success("Banner e vinculações criadas com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar banner.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setFormData({ nome: "", campanha_id: "", url_destino: "", peso: 1 });
    setSelectedFile(null);
    setSelectedSlots([]);
  }

  const filtered = banners.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.campanhas?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Buscar por nome ou campanha..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold gap-2">
              <Plus size={18} />
              Criar Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Criativo Publicitário</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campanha Ativa</Label>
                  <Select onValueChange={(val) => setFormData({...formData, campanha_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a campanha..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campanhas.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.anunciantes?.nome} - {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nome do Banner (Interno)</Label>
                  <Input 
                    placeholder="Ex: Coca-Cola 728x90 Dezembro" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL de Destino</Label>
                  <Input 
                    placeholder="https://..." 
                    value={formData.url_destino}
                    onChange={(e) => setFormData({...formData, url_destino: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arquivo da Imagem</Label>
                  <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:bg-zinc-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <div className="flex flex-col items-center gap-2">
                      {selectedFile ? (
                        <div className="text-blue-600 font-bold text-xs truncate w-full">
                          <Check size={16} className="inline mr-1" /> {selectedFile.name}
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="text-zinc-400" />
                          <span className="text-xs text-zinc-500 font-medium">Clique para fazer upload</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2"><Layout size={16} /> Vincular aos Slots</Label>
                <div className="bg-zinc-50 rounded-xl p-2 border border-zinc-200">
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-2">
                      {slots.map(slot => (
                        <div 
                          key={slot.id} 
                          onClick={() => toggleSlot(slot.id)}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border",
                            selectedSlots.includes(slot.id) 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{slot.nome}</span>
                            <span className="text-[10px] opacity-70 font-mono">{slot.slug}</span>
                          </div>
                          {selectedSlots.includes(slot.id) && <Check size={14} />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <Label>Peso de Exibição (1-10)</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={formData.peso}
                    onChange={(e) => setFormData({...formData, peso: parseInt(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-400">Pesos maiores aumentam a chance do banner aparecer em slots compartilhados.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : "Salvar Banner & Vincular"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead className="font-bold">Preview</TableHead>
              <TableHead className="font-bold">Banner / Campanha</TableHead>
              <TableHead className="font-bold">Slots Vinculados</TableHead>
              <TableHead className="font-bold text-center">Cliques / Views</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-40"><Loader2 className="animate-spin mx-auto text-zinc-300" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-40 text-zinc-400">Nenhum banner cadastrado.</TableCell></TableRow>
            ) : filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="w-16 h-10 bg-zinc-100 rounded border border-zinc-200 overflow-hidden relative group cursor-pointer" onClick={() => window.open(b.url_imagem, '_blank')}>
                    <img src={b.url_imagem} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye size={12} className="text-white" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-zinc-900">{b.nome}</div>
                  <div className="text-xs text-zinc-500">{b.campanhas?.anunciantes?.nome} • {b.campanhas?.nome}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {b.banners_slots?.map(bs => (
                      <Badge key={bs.slot_id} variant="secondary" className="text-[9px] py-0 px-1.5 font-mono uppercase bg-zinc-100 text-zinc-600">
                        {bs.slots_publicitarios.slug}
                      </Badge>
                    ))}
                    {(!b.banners_slots || b.banners_slots.length === 0) && (
                      <span className="text-[10px] text-red-400 font-bold italic">Nenhum slot vinculado</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm font-bold text-zinc-900">{b.total_cliques} <span className="text-[10px] text-zinc-400 font-medium">cliques</span></div>
                  <div className="text-xs text-zinc-500">{b.total_views} <span className="text-[10px] text-zinc-400 font-medium">views</span></div>
                </TableCell>
                <TableCell>
                   <Button variant="ghost" size="icon" onClick={() => window.open(b.url_destino, '_blank')}>
                      <ExternalLink size={14} className="text-zinc-400" />
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
