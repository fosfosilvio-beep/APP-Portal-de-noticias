import { Newspaper, Plus } from "lucide-react";
import Link from "next/link";
import NoticiasList from "@/components/admin/noticias/NoticiasList";

export default function NoticiasPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Newspaper size={20} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Central de Notícias</h1>
            <p className="text-sm text-slate-400">Listagem, busca, reordenação e gestão de publicações.</p>
          </div>
        </div>
        <Link
          href="/admin/noticias/novo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg"
        >
          <Plus size={16} />
          Nova Matéria
        </Link>
      </div>
      
      <NoticiasList />
    </div>
  );
}
