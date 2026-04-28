"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Trash2, 
  Edit2,
  Loader2,
  CheckCircle2,
  XCircle
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

interface Anunciante {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  status: string;
  created_at: string;
}

export default function AnunciantesClient() {
  const [anunciantes, setAnunciantes] = useState<Anunciante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    fetchAnunciantes();
  }, []);

  async function fetchAnunciantes() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("anunciantes")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setAnunciantes(data || []);
    } catch (err) {
      console.error("Erro ao carregar anunciantes:", err);
      toast.error("Falha ao carregar anunciantes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.nome) return toast.error("Nome é obrigatório.");
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("anunciantes")
        .insert([formData]);

      if (error) throw error;
      
      toast.success("Anunciante cadastrado com sucesso!");
      setIsDialogOpen(false);
      setFormData({ nome: "", email: "", whatsapp: "" });
      fetchAnunciantes();
    } catch (err) {
      console.error("Erro ao salvar anunciante:", err);
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este anunciante? Todas as campanhas vinculadas serão removidas.")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("anunciantes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Anunciante removido.");
      fetchAnunciantes();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      toast.error("Falha ao deletar.");
    }
  }

  const filtered = anunciantes.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Ações e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Buscar por nome ou email..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold gap-2">
              <Plus size={18} />
              Novo Anunciante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Anunciante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Razão Social</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Coca-Cola Brasil" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contato</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="exemplo@anunciante.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp / Telefone</Label>
                <Input 
                  id="whatsapp" 
                  placeholder="(43) 99999-9999" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : "Salvar Anunciante"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableHead className="font-bold text-zinc-900">Nome</TableHead>
              <TableHead className="font-bold text-zinc-900">Contato</TableHead>
              <TableHead className="font-bold text-zinc-900">Status</TableHead>
              <TableHead className="font-bold text-zinc-900">Data de Cadastro</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="animate-spin" size={20} />
                    Carregando anunciantes...
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-zinc-500">
                  Nenhum anunciante encontrado.
                </TableCell>
              </TableRow>
            ) : filtered.map((anunciante) => (
              <TableRow key={anunciante.id}>
                <TableCell>
                  <div className="font-bold text-zinc-900">{anunciante.nome}</div>
                  <div className="text-xs text-zinc-400 font-mono uppercase">{anunciante.id.slice(0, 8)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {anunciante.email && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <Mail size={12} /> {anunciante.email}
                      </div>
                    )}
                    {anunciante.whatsapp && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <Phone size={12} /> {anunciante.whatsapp}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={anunciante.status === 'ativo' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-zinc-100 text-zinc-700'}>
                    {anunciante.status === 'ativo' ? (
                      <div className="flex items-center gap-1"><CheckCircle2 size={12} /> Ativo</div>
                    ) : (
                      <div className="flex items-center gap-1"><XCircle size={12} /> Inativo</div>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {new Date(anunciante.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Edit2 size={14} /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(anunciante.id)}
                      >
                        <Trash2 size={14} /> Excluir
                      </DropdownMenuItem>
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
