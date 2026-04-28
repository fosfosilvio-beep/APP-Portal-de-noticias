"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  Maximize, 
  Trash2, 
  Edit2,
  Loader2,
  Code
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

interface Slot {
  id: string;
  nome: string;
  slug: string;
  largura_padrao: number;
  altura_padrao: number;
  page_context: string;
}

export default function SlotsClient() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    largura_padrao: 0,
    altura_padrao: 0,
    page_context: "global"
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("slots_publicitarios")
        .select("*")
        .order("slug");

      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      toast.error("Erro ao carregar slots.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.nome || !formData.slug) return toast.error("Preencha os campos obrigatórios.");
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("slots_publicitarios")
        .insert([formData]);

      if (error) throw error;
      
      toast.success("Slot cadastrado!");
      setIsDialogOpen(false);
      setFormData({ nome: "", slug: "", largura_padrao: 0, altura_padrao: 0, page_context: "global" });
      fetchSlots();
    } catch (err) {
      toast.error("Erro ao salvar slot.");
    } finally {
      setIsSaving(false);
    }
  }

  const filtered = slots.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Buscar por identificador ou slug..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold gap-2">
              <Plus size={18} />
              Novo Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Novo Espaço (Slot)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Identificador</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Topo da Home (Full)" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug Único (Usado no código)</Label>
                <Input 
                  id="slug" 
                  placeholder="ex: home__header_top" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Largura (px)</Label>
                  <Input 
                    type="number" 
                    value={formData.largura_padrao}
                    onChange={(e) => setFormData({...formData, largura_padrao: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (px)</Label>
                  <Input 
                    type="number" 
                    value={formData.altura_padrao}
                    onChange={(e) => setFormData({...formData, altura_padrao: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : "Salvar Slot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead className="font-bold">Identificador</TableHead>
              <TableHead className="font-bold">Slug (Code)</TableHead>
              <TableHead className="font-bold">Dimensões</TableHead>
              <TableHead className="font-bold">Contexto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center h-40"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-bold text-zinc-900">{s.nome}</TableCell>
                <TableCell><Badge variant="outline" className="font-mono text-[10px]"><Code size={10} className="mr-1" /> {s.slug}</Badge></TableCell>
                <TableCell className="text-zinc-500 font-medium flex items-center gap-1.5">
                  <Maximize size={14} /> {s.largura_padrao}x{s.altura_padrao} px
                </TableCell>
                <TableCell><Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 uppercase text-[10px] font-black">{s.page_context}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
