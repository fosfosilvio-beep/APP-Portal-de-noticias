"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Flag, 
  Calendar, 
  Trash2, 
  Edit2,
  Loader2,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Clock
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Campanha {
  id: string;
  nome: string;
  anunciante_id: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  created_at: string;
  anunciantes?: {
    nome: string;
  };
}

interface Anunciante {
  id: string;
  nome: string;
}

export default function CampanhasClient() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [anunciantes, setAnunciantes] = useState<Anunciante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    anunciante_id: "",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    status: "rascunho"
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const supabase = createClient();
      
      // Campanhas
      const { data: cData, error: cErr } = await supabase
        .from("campanhas")
        .select("*, anunciantes(nome)")
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;
      setCampanhas(cData || []);

      // Anunciantes para o Select
      const { data: aData, error: aErr } = await supabase
        .from("anunciantes")
        .select("id, nome")
        .eq("status", "ativo")
        .order("nome");

      if (aErr) throw aErr;
      setAnunciantes(aData || []);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Falha ao sincronizar dados.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.nome || !formData.anunciante_id || !formData.data_inicio) {
      return toast.error("Preencha todos os campos obrigatórios.");
    }
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("campanhas")
        .insert([{
          ...formData,
          data_fim: formData.data_fim || null
        }]);

      if (error) throw error;
      
      toast.success("Campanha criada!");
      setIsDialogOpen(false);
      setFormData({
        nome: "",
        anunciante_id: "",
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: "",
        status: "rascunho"
      });
      fetchData();
    } catch (err) {
      console.error("Erro ao salvar campanha:", err);
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("campanhas")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Status atualizado para ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error("Falha ao atualizar status.");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle2 size={12} /> Ativa</Badge>;
      case 'pausada': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><PauseCircle size={12} /> Pausada</Badge>;
      case 'finalizada': return <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 gap-1"><XCircle size={12} /> Finalizada</Badge>;
      default: return <Badge variant="outline" className="gap-1"><Clock size={12} /> Rascunho</Badge>;
    }
  };

  const filtered = campanhas.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.anunciantes?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Buscar campanha ou anunciante..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold gap-2">
              <Plus size={18} />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Anunciante</Label>
                <Select onValueChange={(val) => setFormData({...formData, anunciante_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {anunciantes.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Campanha</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Black Friday 2026" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inicio">Data Início</Label>
                  <Input 
                    id="inicio" 
                    type="date" 
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fim">Data Fim (Opcional)</Label>
                  <Input 
                    id="fim" 
                    type="date" 
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status Inicial</Label>
                <Select defaultValue="rascunho" onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : "Criar Campanha"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableHead className="font-bold text-zinc-900">Campanha</TableHead>
              <TableHead className="font-bold text-zinc-900">Anunciante</TableHead>
              <TableHead className="font-bold text-zinc-900">Período</TableHead>
              <TableHead className="font-bold text-zinc-900">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <Loader2 className="animate-spin mx-auto text-zinc-300" />
                </TableCell>
              </TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-bold text-zinc-900 flex items-center gap-2">
                    <Flag size={14} className="text-zinc-400" />
                    {c.nome}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 font-medium">{c.anunciantes?.nome}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(c.data_inicio).toLocaleDateString('pt-BR')}</span>
                    {c.data_fim && <span className="flex items-center gap-1">até {new Date(c.data_fim).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(c.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateStatus(c.id, 'ativa')}>Ativar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(c.id, 'pausada')}>Pausar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(c.id, 'finalizada')}>Finalizar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
